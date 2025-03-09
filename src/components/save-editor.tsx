"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, Save, FileX } from "lucide-react"

interface SaveEditorProps {
  saveData: any
  onSave: (updatedSave: any) => void
  onUnload?: () => void
}

export function SaveEditor({ saveData, onSave, onUnload }: SaveEditorProps) {
  const [editedSave, setEditedSave] = useState({ ...saveData })
  const [newItem, setNewItem] = useState("")

  const handleChange = (path: string, value: any) => {
    const pathParts = path.split(".")
    const newSave = { ...editedSave }

    let current = newSave
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
    }

    current[pathParts[pathParts.length - 1]] = value
    setEditedSave(newSave)
  }

  const handleNumberChange = (path: string, value: string) => {
    const numValue = value === "" ? 0 : Number(value)
    handleChange(path, numValue)
  }

  const addInventoryItem = () => {
    if (newItem.trim() && !editedSave.inventory.includes(newItem)) {
      const newInventory = [...editedSave.inventory, newItem]
      handleChange("inventory", newInventory)

      // Also add to discovered items if not already there
      if (!editedSave.discoveredItems.includes(newItem.split(" | ")[1] || newItem)) {
        const itemName = newItem.split(" | ")[1] || newItem
        const newDiscovered = [...editedSave.discoveredItems, itemName]
        handleChange("discoveredItems", newDiscovered)
      }

      setNewItem("")
    }
  }

  const removeInventoryItem = (index: number) => {
    const newInventory = [...editedSave.inventory]
    newInventory.splice(index, 1)
    handleChange("inventory", newInventory)
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
                    {editedSave.inventory.length === 0 ? (
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
                      {editedSave.discoveredItems.map((item: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {item}
                        </Badge>
                      ))}
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

        <div className="mt-6 flex justify-end space-x-2">
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
      </CardContent>
    </Card>
  )
}

