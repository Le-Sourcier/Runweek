import { AlertCircle } from "lucide-react";
import Button from "../ui/Button";
import { Modal } from "../ui/Modal";
import Spiner from "../ui/Spiner";

interface DeleteGoalModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  goalTitle: string;
}

export const DeleteGoalModal: React.FC<DeleteGoalModalProps> = ({
  isOpen,
  isLoading,
  goalTitle,
  onClose,
  onConfirm,
}) => {

  if(!isOpen) {
    return <></>;
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmation de suppression"
      size="md"
    >
      <div className="space-y-4">
        
        <div className="grid grid-cols-1 items-center justify-center mb-4">
          <div className="flex items-center">
            <AlertCircle size={48} className="mr-2 text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-2" />
            <h3 className="text-sm text-red-500 text-center">
              Attention, cette action est irréversible.
            </h3>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Vous êtes sur le point de supprimer l'objectif&nbsp;
          <span className="font-semibold text-foreground">"{goalTitle}"</span>.  
          Cette action est irréversible.  
          Êtes-vous sûr de vouloir continuer ?
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Spiner />}
            {isLoading ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
