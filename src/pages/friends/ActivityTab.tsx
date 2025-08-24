import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useFriendsStore } from "../../stores/friends";
import ActivityFeed from "../../components/friends/ActivityFeed";
import CommentModal from "../../components/friends/CommentModal";
import Card from "../../components/ui/Card";

const ActivityTab: React.FC = () => {
  const { friendActivities, getFriendActivities, isActivityLoading } =
    useFriendsStore();

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedActivityForComment, setSelectedActivityForComment] = useState<{
    id: string;
    friendName: string;
  } | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        await getFriendActivities();
      } catch (error) {
        toast.error("Erreur lors du chargement des activités");
      }
    };

    loadActivities();
  }, [getFriendActivities]);

  const handleLikeActivity = async (activityId: string) => {
    try {
      // Implémentez cet appel API dans votre store si nécessaire
      // await apiUtils.post(`/api/activities/${activityId}/like`);
      toast.success("Activité likée !");
    } catch (error) {
      toast.error("Erreur lors du like");
    }
  };

  const handleCommentActivity = (activityId: string, friendName: string) => {
    setSelectedActivityForComment({ id: activityId, friendName });
    setIsCommentModalOpen(true);
  };

  const handleShareActivity = async (activityId: string) => {
    try {
      const activity = friendActivities.find((a) => a.id === activityId);
      if (!activity) return;

      const shareContent = {
        title: `${activity.friend.name} - ${activity.title}`,
        text: `${activity.description}\n\nVia Runweek`,
        url: `${window.location.origin}/activity/${activityId}`,
      };

      if (navigator.share) {
        await navigator.share(shareContent);
        toast.success("Activité partagée avec succès !");
      } else {
        await navigator.clipboard.writeText(
          `${shareContent.title}\n${shareContent.text}\n${shareContent.url}`
        );
        toast.success("Lien copié dans le presse-papiers !");
      }
    } catch (error) {
      console.error("Erreur lors du partage:", error);
      toast.error("Erreur lors du partage");
    }
  };

  const handleSubmitComment = async (commentText: string) => {
    if (!selectedActivityForComment) return;

    try {
      // Implémentez cet appel API dans votre store si nécessaire
      // await apiUtils.post(`/api/activities/${selectedActivityForComment.id}/comments`, {
      //   text: commentText
      // });

      toast.success(
        `Commentaire ajouté sur l'activité de ${selectedActivityForComment.friendName}`
      );
      setIsCommentModalOpen(false);
      setSelectedActivityForComment(null);

      // Recharger les activités
      await getFriendActivities();
    } catch (error) {
      toast.error("Erreur lors de l'ajout du commentaire");
    }
  };

  if (isActivityLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">
          Chargement des activités...
        </p>
      </div>
    );
  }

  return (
    <>
      <Card title="Activité de vos amis">
        <ActivityFeed
          activities={friendActivities}
          onLikeActivity={handleLikeActivity}
          onCommentActivity={handleCommentActivity}
          onShareActivity={handleShareActivity}
        />
      </Card>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setSelectedActivityForComment(null);
        }}
        friendName={selectedActivityForComment?.friendName || ""}
        onSubmitComment={handleSubmitComment}
      />
    </>
  );
};

export default ActivityTab;
