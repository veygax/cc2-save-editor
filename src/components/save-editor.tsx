"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, Save, FileX, Undo2, Redo2, X } from "lucide-react"
import { toast } from "sonner"

interface SaveEditorProps {
  saveData: any
  onSave: (updatedSave: any) => void
  onUnload?: () => void
}

export function SaveEditor({ saveData, onSave, onUnload }: SaveEditorProps) {
  const [editedSave, setEditedSave] = useState({ ...saveData })
  const [newItem, setNewItem] = useState("")
  const [history, setHistory] = useState<any[]>([{ ...saveData }])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Add to history when editedSave changes
  const addToHistory = useCallback((newState: any) => {
    // Only add to history if the state is different from the current one
    if (JSON.stringify(newState) !== JSON.stringify(history[historyIndex])) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push({ ...newState })
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setEditedSave({ ...history[historyIndex - 1] })
      toast("Undo successful", { description: "Previous change has been undone" })
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setEditedSave({ ...history[historyIndex + 1] })
      toast("Redo successful", { description: "Change has been reapplied" })
    }
  }, [history, historyIndex])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (!e.shiftKey) {
          undo()
        } else {
          redo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const handleChange = (path: string, value: any) => {
    const pathParts = path.split(".")
    const newSave = { ...editedSave }

    let current = newSave
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i]
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    }

    current[pathParts[pathParts.length - 1]] = value
    setEditedSave(newSave)
    addToHistory(newSave)
  }

  const handleNumberChange = (path: string, value: string) => {
    const numValue = value === "" ? 0 : Number(value)
    handleChange(path, numValue)
  }

  const addInventoryItem = () => {
    if (newItem.trim()) {
      const inventory = editedSave.inventory || [];
      
      if (!inventory.includes(newItem)) {
        const newInventory = [...inventory, newItem];
        
        const updatedSave = { ...editedSave };
        updatedSave.inventory = newInventory;
        
        // Also add to discovered items if not already there
        const discoveredItems = updatedSave.discoveredItems || [];
        if (!discoveredItems.includes(newItem.split(" | ")[1] || newItem)) {
          const itemName = newItem.split(" | ")[1] || newItem;
          updatedSave.discoveredItems = [...discoveredItems, itemName];
        }
        
        setEditedSave(updatedSave);
        addToHistory(updatedSave);
        setNewItem("");
      }
    }
  }

  const removeInventoryItem = (index: number) => {
    if (editedSave.inventory && editedSave.inventory.length > index) {
      const newInventory = [...editedSave.inventory];
      newInventory.splice(index, 1);
      
      // directly update the editedSave
      const updatedSave = { ...editedSave };
      updatedSave.inventory = newInventory;
      
      setEditedSave(updatedSave);
      addToHistory(updatedSave);
    }
  }

  const removeDiscoveredItem = (index: number) => {
    if (editedSave.discoveredItems && editedSave.discoveredItems.length > index) {
      const newDiscoveredItems = [...editedSave.discoveredItems];
      newDiscoveredItems.splice(index, 1);
      
      const updatedSave = { ...editedSave };
      updatedSave.discoveredItems = newDiscoveredItems;
      
      setEditedSave(updatedSave);
      addToHistory(updatedSave);
    }
  }

  const handleSaveChanges = () => {
    onSave(editedSave)
  }

  return (
    <Card className="border border-blue-200">
      <CardHeader>
        <CardTitle>Edit Save Data</CardTitle>
        <CardDescription>Modify your game save values</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">Basic Stats</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="money">Money ($ in cents)</Label>
                <Input
                  id="money"
                  type="number"
                  value={editedSave.money}
                  onChange={(e) => handleNumberChange("money", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tickets">Tickets</Label>
                <Input
                  id="tickets"
                  type="number"
                  value={editedSave.tickets}
                  onChange={(e) => handleNumberChange("tickets", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tokens">Tokens</Label>
                <Input
                  id="tokens"
                  type="number"
                  value={editedSave.tokens}
                  onChange={(e) => handleNumberChange("tokens", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="xp">XP</Label>
                <Input
                  id="xp"
                  type="number"
                  value={editedSave.xp}
                  onChange={(e) => handleNumberChange("xp", e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-medium mb-2">Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(editedSave.stats).map(([key, value]: [string, any]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`stats-${key}`}>{key.replace(/_/g, " ")}</Label>
                    <Input
                      id={`stats-${key}`}
                      type="number"
                      value={value}
                      onChange={(e) => handleNumberChange(`stats.${key}`, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new item (e.g. 'AWP | Dragon Lore (Factory New)')"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addInventoryItem()}
                />
                <Button onClick={addInventoryItem} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="border rounded-md">
                <ScrollArea className="h-[300px] p-4">
                  <div className="space-y-2">
                    {!editedSave.inventory || editedSave.inventory.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No items in inventory</p>
                    ) : (
                      editedSave.inventory.map((item: string, index: number) => (
                        <div key={index} className="flex items-center justify-between group">
                          <Badge variant="outline" className="flex-1 justify-start font-normal text-xs py-2 px-3">
                            {item}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeInventoryItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Discovered Items</h3>
                <div className="border rounded-md p-4">
                  <ScrollArea className="h-[150px]">
                    <div className="flex flex-wrap gap-2">
                      {editedSave.discoveredItems && editedSave.discoveredItems.length > 0 ? (
                        editedSave.discoveredItems.map((item: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="group cursor-pointer hover:bg-secondary/80 transition-colors"
                          >
                            <span>{item}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeDiscoveredItem(index)}
                            >
                              <X className="h-3 w-3 text-destructive" />
                            </Button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center w-full py-4">No discovered items</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upgrades">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(editedSave.upgrades).map(([key, value]: [string, any]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`upgrades-${key}`}>
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </Label>
                  <Input
                    id={`upgrades-${key}`}
                    type="number"
                    value={value}
                    onChange={(e) => handleNumberChange(`upgrades.${key}`, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-between">
          <div className="flex space-x-2">
            <Button
              onClick={undo}
              variant="outline"
              size="icon"
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={redo}
              variant="outline"
              size="icon"
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            {onUnload && (
              <Button
                onClick={onUnload}
                variant="destructive"
                className="bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600"
              >
                <FileX className="mr-2 h-4 w-4" />
                Unload Save
              </Button>
            )}
            <Button
              onClick={handleSaveChanges}
              className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

