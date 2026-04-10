import * as React from "react";
import { useState, useMemo } from "react";
import { Search, Terminal, AlertCircle, Code2, Lightbulb, ChevronRight, Loader2, Sparkles, History, FileCode, Send, ShieldCheck, FileText, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { COMMON_ERRORS, LocalError } from "./data/errors";
import { explainError, analyzeCode, ErrorExplanation } from "./lib/gemini";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userCode, setUserCode] = useState("");
  const [selectedError, setSelectedError] = useState<LocalError | ErrorExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<(LocalError | ErrorExplanation)[]>([]);
  const [codeHistory, setCodeHistory] = useState<string[]>([]);
  const [isAiMode, setIsAiMode] = useState(false);

  const filteredErrors = useMemo(() => {
    if (!searchQuery) return COMMON_ERRORS;
    return COMMON_ERRORS.filter(
      (err) =>
        err.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        err.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        err.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    const localMatch = COMMON_ERRORS.find(
      (err) => err.code.toLowerCase() === searchQuery.toLowerCase()
    );

    if (localMatch) {
      setSelectedError(localMatch);
      addToHistory(localMatch);
      return;
    }

    setIsLoading(true);
    setIsAiMode(true);
    try {
      const result = await explainError(searchQuery);
      setSelectedError(result);
      addToHistory(result);
    } catch (error) {
      console.error("AI Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeCode = async () => {
    if (!userCode.trim()) return;
    setIsLoading(true);
    setIsAiMode(true);
    
    // Add to code history
    if (!codeHistory.includes(userCode)) {
      setCodeHistory(prev => [userCode, ...prev].slice(0, 10));
    }

    try {
      const result = await analyzeCode(userCode);
      setSelectedError(result);
      addToHistory(result);
      document.getElementById("ai-result")?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Code analysis failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToHistory = (error: LocalError | ErrorExplanation) => {
    setHistory((prev) => {
      const exists = prev.find((h) => ("code" in h ? h.code : h.explanation) === ("code" in error ? error.code : error.explanation));
      if (exists) return prev;
      return [error, ...prev].slice(0, 5);
    });
  };

  const selectError = (error: LocalError | ErrorExplanation) => {
    setSelectedError(error);
    setIsAiMode(!("code" in error));
    addToHistory(error);
    document.getElementById("ai-result")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Terminal className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">DebugSense</h1>
          </div>
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" className="gap-2 h-8" />}>
                <History className="w-4 h-4" />
                Code History
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px] bg-background border-border">
                <SheetHeader>
                  <SheetTitle>Previous Code Snippets</SheetTitle>
                  <SheetDescription>
                    Review and reuse code you've previously analyzed.
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                  <div className="space-y-4">
                    {codeHistory.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileCode className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No code history yet.</p>
                      </div>
                    ) : (
                      codeHistory.map((code, idx) => (
                        <Card key={idx} className="bg-secondary/20 border-border/50 group relative">
                          <CardContent className="p-4">
                            <pre className="text-[10px] font-mono text-muted-foreground truncate overflow-hidden bg-black/20 p-2 rounded">
                              {code}
                            </pre>
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Snippet #{codeHistory.length - idx}</span>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-[10px]"
                                  onClick={() => setUserCode(code)}
                                >
                                  Load
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-[10px] text-destructive hover:text-destructive"
                                  onClick={() => setCodeHistory(prev => prev.filter((_, i) => i !== idx))}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider opacity-60">
              v1.2.0-pro
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-12">
        
        {/* 1. Code Analysis Area (Top) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Paste Your Code</h2>
            </div>
            {userCode && (
              <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => setUserCode("")}>
                Clear Code
              </Button>
            )}
          </div>
          <Card className="bg-secondary/10 border-border/30 overflow-hidden">
            <CardContent className="p-0">
              <Textarea 
                placeholder="Paste your buggy code here..."
                className="min-h-[200px] bg-transparent border-none focus-visible:ring-0 font-mono text-sm p-6 resize-none"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
              />
              <div className="p-4 bg-secondary/20 border-t border-border/30 flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  AI will identify bugs and provide corrected code.
                </p>
                <Button 
                  onClick={handleAnalyzeCode} 
                  disabled={isLoading || !userCode.trim()}
                  className="gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Analyze Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. AI Explanation Result (Middle) */}
        <section id="ai-result" className="min-h-[100px] scroll-mt-24">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card className="bg-secondary/10 border-border/30">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                    <Skeleton className="h-48 w-full rounded-lg" />
                  </CardContent>
                </Card>
              </motion.div>
            ) : selectedError ? (
              <motion.div
                key={isAiMode ? "ai" : ("code" in selectedError ? selectedError.code : "ai")}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="bg-secondary/10 border-border/30 overflow-hidden shadow-2xl shadow-primary/5">
                  <CardHeader className="border-b border-border/30 bg-secondary/5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isAiMode ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                          {isAiMode ? <Sparkles className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold">
                            {"title" in selectedError ? selectedError.title : "Analysis Result"}
                          </CardTitle>
                          <CardDescription className="font-mono text-xs mt-1">
                            {"code" in selectedError ? selectedError.code : "AI Identified Issue"}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isAiMode && <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">AI Insight</Badge>}
                        {"category" in selectedError && <Badge variant="outline">{selectedError.category}</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Tabs defaultValue="explanation" className="w-full">
                      <TabsList className="w-full justify-start rounded-none border-b border-border/30 bg-transparent h-12 px-6 gap-6">
                        <TabsTrigger value="explanation" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0">
                          Explanation
                        </TabsTrigger>
                        <TabsTrigger value="fix" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0">
                          Solution & Code
                        </TabsTrigger>
                      </TabsList>
                      
                      <div className="p-6 space-y-8">
                        <TabsContent value="explanation" className="mt-0 space-y-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                              <AlertCircle className="w-4 h-4" />
                              The Issue
                            </div>
                            <p className="text-lg leading-relaxed text-foreground/90">
                              {selectedError.explanation}
                            </p>
                          </div>

                          <Separator className="bg-border/30" />

                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                              <Lightbulb className="w-4 h-4" />
                              Root Cause
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              {selectedError.cause}
                            </p>
                          </div>
                        </TabsContent>

                        <TabsContent value="fix" className="mt-0 space-y-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                              <Code2 className="w-4 h-4" />
                              How to Fix
                            </div>
                            <p className="text-lg leading-relaxed text-foreground/90">
                              {selectedError.fix}
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                <Terminal className="w-4 h-4" />
                                Corrected Code
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-[10px] uppercase font-bold"
                                onClick={() => {
                                  const code = "codeExample" in selectedError ? selectedError.codeExample : "";
                                  navigator.clipboard.writeText(code);
                                }}
                              >
                                Copy Code
                              </Button>
                            </div>
                            <div className="relative group">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                              <pre className="relative bg-[#0d1117] p-6 rounded-lg border border-border/50 overflow-x-auto font-mono text-sm leading-relaxed text-blue-100">
                                <code>{selectedError.codeExample}</code>
                              </pre>
                            </div>
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        {/* 3. Search & Common Errors (Bottom) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Search className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Search Database</h2>
              </div>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search error codes (e.g. 404)..."
                  className="pl-10 h-11 bg-secondary/30 border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {history.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <History className="w-3 h-3 text-muted-foreground" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recent</h2>
                </div>
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div 
                      key={i}
                      onClick={() => selectError(h)}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-2 group transition-colors"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="truncate">{"code" in h ? h.title : "AI Analysis"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Common Errors Library</h2>
              <Badge variant="secondary" className="text-[10px]">{COMMON_ERRORS.length} Items</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredErrors.map((err) => (
                <motion.div
                  key={err.code}
                  whileHover={{ y: -2 }}
                  onClick={() => selectError(err)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedError && "code" in selectedError && selectedError.code === err.code
                      ? "bg-secondary border-primary/50"
                      : "bg-secondary/10 border-border/30 hover:bg-secondary/20"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-[9px] h-4">{err.category}</Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{err.title}</h3>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{err.code}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12 mt-24">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="flex items-center justify-center gap-8">
            <Dialog>
              <DialogTrigger render={<button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5" />}>
                <ShieldCheck className="w-3 h-3" />
                Privacy Policy
              </DialogTrigger>
              <DialogContent className="bg-background border-border max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Privacy Policy</DialogTitle>
                  <DialogDescription>
                    Last updated: April 10, 2026
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    At DebugSense, we prioritize your privacy. This policy outlines how we handle your data:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Code Snippets:</strong> Your code is sent to Google Gemini AI for analysis. We do not store your code permanently on our servers.</li>
                    <li><strong>Local Storage:</strong> Your code history and search history are stored locally in your browser. Clearing your browser data will remove this history.</li>
                    <li><strong>No Tracking:</strong> We do not use third-party tracking cookies or sell your personal information.</li>
                    <li><strong>AI Usage:</strong> By using this tool, you acknowledge that your code is processed by AI models to provide debugging insights.</li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger render={<button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5" />}>
                <FileText className="w-3 h-3" />
                Terms of Service
              </DialogTrigger>
              <DialogContent className="bg-background border-border max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Terms of Service</DialogTitle>
                  <DialogDescription>
                    Last updated: April 10, 2026
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    By accessing DebugSense, you agree to the following terms:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Usage:</strong> This tool is provided for educational and debugging purposes. Do not use it for production-critical code without manual verification.</li>
                    <li><strong>AI Accuracy:</strong> AI-generated explanations and fixes may contain errors. DebugSense is not liable for any issues arising from the use of suggested code.</li>
                    <li><strong>Prohibited Content:</strong> Do not upload sensitive credentials, API keys, or proprietary code that you do not have permission to share.</li>
                    <li><strong>Modifications:</strong> We reserve the right to modify or terminate the service at any time without prior notice.</li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary/40" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">DebugSense AI Engine</span>
            </div>
            <p className="text-[9px] text-muted-foreground/60">
              Powered by Google Gemini 3 Flash. &copy; 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
