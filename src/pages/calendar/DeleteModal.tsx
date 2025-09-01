import { FC, useState } from "react";
import { DeleteConfirmModal } from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Spiner from "../../components/ui/Spiner";
import { CalendarEventType } from "../Calendar";
import { useCalendarStore } from "../../stores/CalendarStore";
import { extractErrorMessage } from "../../utils/error-handler";
import { useMessages } from "../../hooks/useMessage";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEventType | null;
}

export const DeleteModal: FC<DeleteModalProps> = ({ isOpen, onClose, event }) => {

  const { showMessage } = useMessages();
  const { deleteEvent } = useCalendarStore();

  const [isLoading, setIsLoading] = useState(false);

  if (!event) {
    return <></>;
  }

  const onConfirm = async () => {
    setIsLoading(true);
    try {
      await deleteEvent(event.id);
      onClose();
      showMessage("EVENT_DELETED");
    } catch (error) {
      showMessage(extractErrorMessage(error).message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <DeleteConfirmModal isOpen={isOpen} onClose={onClose}>
      <p className="text-md text-muted-foreground">
        Vous êtes sur le point de supprimer l'événement&nbsp;
        <span className="font-semibold text-foreground">"{event.title}"</span>.
        Cette action est irréversible.
        Êtes-vous sûr de vouloir continuer ?
      </p>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => { onClose(); setIsLoading(false); }}>
          Annuler
        </Button>
        <Button variant="destructive" onClick={() => { onConfirm(); setIsLoading(true); }} disabled={isLoading}>
          {isLoading && <Spiner />}
          {isLoading ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </DeleteConfirmModal>
  );
}