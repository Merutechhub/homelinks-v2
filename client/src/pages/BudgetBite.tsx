import AppLayout from "@/components/layout/AppLayout";
import { mockRecipes } from "@/data/mockData";
import { Sparkles, Filter, Clock, Receipt, Utensils } from "lucide-react";
import { useState } from "react";

export default function BudgetBite() {
  const [budget, setBudget] = useState("500");
  const [type, setType] = useState<"all" | "homemade" | "vendor">("all");

  return (
    <AppLayout>
      <div className="p-4 flex flex-col gap-6">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-primary/20 to-transparent p-6 rounded-2xl border border-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-display font-bold mb-2">Eat well on <br/>any budget.</h1>
            <p className="text-sm text-muted-foreground mb-4">Find meals, recipes, and vendor spots that fit your pocket perfectly.</p>
          </div>
          <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 text-primary/10 rotate-12" />
        </div>

        {/* Budget Query Form */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <label className="text-sm font-semibold mb-2 block">What's your budget today? (KSh)</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="flex-1 bg-muted border-none rounded-xl px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g. 300"
            />
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              Find Meals
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border overflow-x-auto no-scrollbar">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-medium text-muted-foreground shrink-0">Filter:</span>
            {["all", "homemade", "vendor"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  type === t 
                    ? "bg-foreground text-background" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-bold px-1">Top Matches for KSh {budget}</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {mockRecipes.map(recipe => (
              <div key={recipe.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur text-foreground text-[10px] font-bold px-2 py-1 rounded-md">
                    KSh {recipe.cost}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate mb-1">{recipe.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {recipe.time}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {recipe.type === "Homemade" ? <Utensils className="w-3 h-3"/> : <Receipt className="w-3 h-3"/>}
                      {recipe.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}