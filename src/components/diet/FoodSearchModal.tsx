import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Search, Plus } from "lucide-react";
import { FoodItem } from "../../types/diet";

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
  searchFood: (query: string) => Promise<FoodItem[]>;
}

const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectFood,
  searchFood,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (query.length > 2) {
        setIsSearching(true);
        try {
          const searchResults = await searchFood(query);
          setResults(searchResults);
        } catch (error) {
          console.error("Erreur de recherche:", error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query, searchFood]);

  const handleSelectFood = (food: FoodItem) => {
    onSelectFood(food);
    setQuery("");
    setResults([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rechercher un aliment"
      size="lg"
    >
      <div className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un aliment..."
            className="pl-10"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={16}
          />

          {/* Suggestions IA basées sur les recommandations */}
          {query.length === 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-foreground mb-2">
                Suggestions IA
              </h4>
              <div className="space-y-2">
                {["Saumon", "Brocoli", "Yaourt grec", "Amandes"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleFoodSearch(suggestion)}
                      className="w-full p-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                    >
                      Rechercher "{suggestion}"
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {isSearching && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">
              Recherche en cours...
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto space-y-2">
            {results.map((food) => (
              <div
                key={food.id}
                className="p-3 border border-border rounded-lg hover:border-primary cursor-pointer transition-colors"
                onClick={() => handleSelectFood(food)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-foreground">{food.name}</h4>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>Protéines: {food.protein}g</span>
                      <span>Glucides: {food.carbs}g</span>
                      <span>Lipides: {food.fat}g</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-foreground">
                      {food.calories}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      cal/100g
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {query.length > 2 && results.length === 0 && !isSearching && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Aucun aliment trouvé pour "{query}"
            </p>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus size={16} />
              Ajouter un nouvel aliment
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FoodSearchModal;
