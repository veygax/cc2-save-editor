"use client"

import { useState, useEffect } from "react";
import { SaveImporter } from "@/components/save-importer";
import { SaveEditor } from "@/components/save-editor";
import { ExportSave } from "@/components/export-save";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { lzw_decode, lzw_encode } from "@/lib/lzw-codec";
import Link from "next/link";

export default function Home() {
  const [saveData, setSaveData] = useState<any>(null)
  const [originalSave, setOriginalSave] = useState<string>("")
  const [originalFilename, setOriginalFilename] = useState<string>("")
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  
  // used for importing saves because mobile devices don't support the accept attribute
  const isMobile = () => {
    const isMobileDevice = 
      /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
      (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1); // hopefully a touch screen mac never drops lol
    
    return isMobileDevice;
  }
  
  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  const handleImport = (saveString: string, filename?: string) => {
    try {
      let decoded;

      // Store the original filename if provided
      if (filename) {
        setOriginalFilename(filename);
      }

      try {
        decoded = JSON.parse(saveString);
        setSaveData(decoded);
        setOriginalSave(saveString);
        toast("Save imported successfully", {
          description: "Your save data was already in JSON format and has been loaded.",
        });
        return;
      } catch {
        decoded = JSON.parse(lzw_decode(saveString));
        setSaveData(decoded);
        setOriginalSave(saveString);
        toast("Save imported successfully", {
          description: "Your save data has been decoded and loaded.",
        });
      }
    } catch {
      toast("Import failed", {
        description: "The save data could not be decoded. Please check the format."
      });
    }
  }

  const handleReset = () => {
    if (originalSave) {
      handleImport(originalSave, originalFilename)
      toast("Save reset", {
        description: "Your save data has been reset to the original values.",
      })
    }
  }

  const handleMaxStats = () => {
  if (!saveData) return;

  const maxedSave = {
    ...saveData,
    money: 2147483647,
    tickets: 2147483647,
    tokens: 2147483647,
    xp: 2147483647,
    upgrades: Object.keys(saveData.upgrades).reduce((acc: any, key: string) => {
      acc[key] =
        key === "unlockCollections" ||
        key === "unlockStickers" ||
        key === "unlockClickEffect2x" ||
        key === "unlockClickEffect4x" ||
        key === "unlockClickEffect7x"
          ? 1
          : 2147483647;
      return acc;
    }, {}),
    stats: {
      ...saveData.stats,
      earned_passive: 2147483647,
      time_played: 2147483647,
      total_winnings: 2147483647,
      earned_cash: 2147483647,
      earnings_from_clicks: 2147483647,
      earned_xp: 2147483647,
      xp_from_clicks: 2147483647,
      clicks: 2147483647,
      items_discovered: 2147483647,
      skins_discovered: 2147483647,
      stickers_discovered: 2147483647,
      opened_cases: 2147483647,
      opened_rarities_2: 2147483647,
      // Keep achievements_completed as is
      achievements_completed: saveData.stats.achievements_completed,
    },
  };

  setSaveData(maxedSave);
  toast("Stats maxed", {
    description: "All stats have been set to maximum values.",
  });

  // Ensure `SaveEditor` recognizes the change
  setTimeout(() => setSaveData({ ...maxedSave }), 0);
};

  const handleSaveChanges = (updatedSave: any) => {
    setSaveData(updatedSave)
    toast("Changes saved", {
      description: "Your modifications have been applied to the save data.",
    })
  }

  const handleUnloadSave = () => {
    setSaveData(null)
    setOriginalSave("")
    setOriginalFilename("")
    toast("Save unloaded", {
      description: "Your save data has been unloaded. You can now import a new save.",
    })
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="case-clicker-theme">
      <main className="min-h-screen bg-white flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-grow">
          <header className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                  <Link 
                    href="https://csgo.mtsl.dk/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                    title="click me to go to the root of your addiction"
                  >
                    Case Clicker 2
                  </Link>{" "}
                  Save Editor
                </h1>
                <p className="text-muted-foreground mt-1">to pretend you have good luck 👍😉</p>
              </div>
              <div className="flex gap-2">
                {saveData && (
                  <>
                    <Button variant="outline" className="bg-red-500 text-white" onClick={handleReset}>
                      Reset
                    </Button>
                    <Button
                      variant="destructive"
                      className="bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700"
                      onClick={handleMaxStats}
                    >
                      Max Stats
                    </Button>
                  </>
                )}
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      toast("Debug Info", {
                        description: `UserAgent: ${navigator.userAgent}\nDetected as mobile: ${isMobileDevice ? 'Yes' : 'No'}`,
                        duration: 10000,
                      });
                    }}
                  >
                    Device Info
                  </Button>
                )}
              </div>
            </div>

            <Tabs defaultValue="editor" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="export" disabled={!saveData}>
                  Export
                </TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="mt-4">
                {!saveData ? (
                  <SaveImporter onImport={handleImport} isMobileDevice={isMobileDevice} />
                ) : (
                  <SaveEditor 
                    saveData={saveData} 
                    onSave={handleSaveChanges} 
                    onUnload={handleUnloadSave}
                  />
                )}
              </TabsContent>
              <TabsContent value="export" className="mt-4">
                {saveData && <ExportSave saveData={saveData} lzw_encode={lzw_encode} originalFilename={originalFilename} />}
              </TabsContent>
            </Tabs>
          </header>
          
          <footer className="py-2 text-center text-sm text-muted-foreground border-t mt-8">
            <p>
              made in 1 hour with ❤️ by{" "}
              <Link 
                href="https://veygax.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium hover:underline text-blue-600 dark:text-blue-400"
              >
                VeygaX :&#41;
              </Link>
              {" "}
              <span className="font-bold">|</span>
              {" it's open source btw, "}
              {process.env.NEXT_PUBLIC_COMMIT_HASH ? (
                <>
                  {"current commit: "}
                  <Link
                    href={`https://github.com/veygax/cc2-save-editor/commit/${process.env.NEXT_PUBLIC_COMMIT_HASH}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {process.env.NEXT_PUBLIC_COMMIT_HASH}
                  </Link>
                </>
              ) : (
                <span className="italic">current commit: you&apos;re running this locally aren&apos;t you.</span>
              )}
            </p>
          </footer>
        </div>
        <Toaster />
      </main>
    </ThemeProvider>
  )
}
