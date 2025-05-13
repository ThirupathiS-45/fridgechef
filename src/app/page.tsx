"use client";

import { useState, type FormEvent } from "react";
import {
  generateRecipe,
  type GenerateRecipeOutput,
  type GenerateRecipeInput,
} from "@/ai/flows/generate-recipe";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Salad,
  Sparkles,
  ChefHat,
  ListChecks,
  BookOpenText,
  Clock3,
  Loader2,
  ExternalLink,
  Mic,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HomePage() {
  const [ingredients, setIngredients] = useState<string>("");
  const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ingredients.trim()) {
      toast({
        title: "No ingredients",
        description: "Please enter some ingredients.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRecipe(null);

    try {
      const input: GenerateRecipeInput = { ingredients, language: selectedLanguage };
      const result = await generateRecipe(input);
      setRecipe(result);
    } catch (error) {
      console.error("Failed to generate recipe:", error);
      toast({
        title: "Error",
        description: "Failed to generate recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceRecognition = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = selectedLanguage === "ta" ? "ta-IN" : "en-US";
    recognition.onstart = () => {
      console.log("Voice recognition started...");
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setIngredients((prev) => prev + " " + transcript);
    };
    recognition.onerror = (event) => {
      console.error("Error in speech recognition:", event);
    };
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-6 md:p-8 selection:bg-accent selection:text-accent-foreground">
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center mb-2">
          <Salad className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Fridge Chef</h1>
        </div>
        <p className="text-lg text-muted-foreground">What's in your fridge? Let's cook something delicious!</p>
      </header>

      <div className="w-full max-w-2xl space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Your Ingredients</CardTitle>
            <CardDescription>List what you have.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language-select" className="flex items-center">
                  Select Language
                </Label>
                <Select
                  value={selectedLanguage}
                  onValueChange={(value) => setSelectedLanguage(value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="language-select" className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="ingredients-input">Ingredients List</Label>
                <Textarea
                  id="ingredients-input"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder={
                    selectedLanguage === "ta"
                      ? "எ.கா., கோழி, வெங்காயம், தக்காளி..."
                      : "e.g., chicken breast, broccoli, soy sauce..."
                  }
                  rows={4}
                  className="pr-12 focus:ring-accent focus:border-accent"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={startVoiceRecognition}
                  disabled={isLoading}
                  className="absolute right-2 bottom-2 text-muted-foreground hover:text-primary"
                  title="Speak Ingredients"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Recipe
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {isLoading && !recipe && (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Crafting your recipe...</p>
          </div>
        )}

        {recipe && (
          <Card className="shadow-xl animate-in fade-in-50 duration-500">
            <CardHeader>
              <div className="flex items-center mb-2">
                <ChefHat className="h-8 w-8 text-primary mr-3 shrink-0" />
                <CardTitle className="text-3xl font-semibold">{recipe.recipeName}</CardTitle>
              </div>
              {(recipe.prepTime || recipe.cookTime) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                  {recipe.prepTime && (
                    <div className="flex items-center">
                      <Clock3 className="mr-1.5 h-4 w-4" />
                      Prep: {recipe.prepTime}
                    </div>
                  )}
                  {recipe.cookTime && (
                    <div className="flex items-center">
                      <Clock3 className="mr-1.5 h-4 w-4" />
                      Cook: {recipe.cookTime}
                    </div>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center mb-2">
                  <ListChecks className="h-6 w-6 text-secondary mr-2 shrink-0" />
                  <h3 className="text-xl font-medium">Ingredients</h3>
                </div>
                <ul className="list-disc list-inside pl-2 space-y-1 text-foreground/90">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <BookOpenText className="h-6 w-6 text-secondary mr-2 shrink-0" />
                  <h3 className="text-xl font-medium">Instructions</h3>
                </div>
                <p className="whitespace-pre-line text-foreground/90 leading-relaxed">{recipe.instructions}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="ghost" onClick={() => { setRecipe(null); setIngredients(""); }}>
                Clear Recipe & Ingredients
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Fridge Chef. Cook with AI.</p>
        <p className="mt-1">
          Powered by{" "}
          <a href="https://www.linkedin.com/in/thirupathis/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
            Thiru
          </a>
          <ExternalLink className="inline-block h-3 w-3 ml-0.5" />
        </p>
      </footer>
    </div>
  );
}
