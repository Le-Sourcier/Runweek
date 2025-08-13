import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Heart, MessageCircle, Share2, Users, UserPlus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../ui/Input';
import Button from '../ui/Button';

const SocialFeed: React.FC = () => {
  const { 
    friends, 
    sharedMeals, 
    friendRequests,
    likeMeal, 
    addComment, 
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    searchUsers 
  } = useSocial();

  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSendFriendRequest = async () => {
    if (!newFriendEmail) return;
    
    const success = await sendFriendRequest(newFriendEmail);
    if (success) {
      setNewFriendEmail('');
    }
  };

  const handleUserSearch = async (query: string) => {
    setUserSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      const results = await searchUsers(query);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddComment = (sharedMealId: string) => {
    const comment = prompt("Ajouter un commentaire:");
    if (comment) {
      addComment(sharedMealId, comment);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demandes d'amis en attente */}
      {friendRequests.length > 0 && (
        <Card title="Demandes d'amis">
          <div className="space-y-3">
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <img
                    src={request.from.profileImage}
                    alt={request.from.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground">{request.from.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.from.mutualFriends} amis en commun
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptFriendRequest(request.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => declineFriendRequest(request.id)}
                    className="btn btn-outline btn-sm"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Ajouter des amis */}
      <Card title="Ajouter des amis">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              value={newFriendEmail}
              onChange={(e) => setNewFriendEmail(e.target.value)}
              placeholder="Email de votre ami"
              className="flex-1"
            />
            <Button onClick={handleSendFriendRequest} disabled={!newFriendEmail}>
              <UserPlus size={16} />
            </Button>
          </div>

          <div className="relative">
            <Input
              type="text"
              value={userSearchQuery}
              onChange={(e) => handleUserSearch(e.target.value)}
              placeholder="Rechercher des utilisateurs..."
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                  </div>
                  <button
                    onClick={() => sendFriendRequest(user.email || '')}
                    className="btn btn-outline btn-sm text-xs"
                  >
                    Ajouter
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Feed des repas partagés */}
      <Card title="Repas partagés par vos amis">
        <div className="space-y-4">
          {sharedMeals.map((sharedMeal, index) => (
            <motion.div
              key={sharedMeal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-border rounded-lg p-4 bg-background"
            >
              {/* Header du post */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={sharedMeal.user.profileImage}
                  alt={sharedMeal.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{sharedMeal.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sharedMeal.timestamp).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {sharedMeal.meal.mealType === 'breakfast' ? 'Petit-déj' :
                   sharedMeal.meal.mealType === 'lunch' ? 'Déjeuner' :
                   sharedMeal.meal.mealType === 'dinner' ? 'Dîner' : 'Collation'}
                </Badge>
              </div>

              {/* Contenu du repas */}
              <div className="mb-3">
                <h4 className="font-semibold text-foreground text-lg">{sharedMeal.meal.foodItem.name}</h4>
                {sharedMeal.description && (
                  <p className="text-sm text-muted-foreground mt-1">{sharedMeal.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{Math.round(sharedMeal.meal.foodItem.calories * (sharedMeal.meal.unit === 'g' ? sharedMeal.meal.quantity / 100 : sharedMeal.meal.quantity))} calories</span>
                  <span>{Math.round(sharedMeal.meal.foodItem.protein * (sharedMeal.meal.unit === 'g' ? sharedMeal.meal.quantity / 100 : sharedMeal.meal.quantity))}g protéines</span>
                  <span>{sharedMeal.meal.quantity}{sharedMeal.meal.unit}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <button
                  onClick={() => likeMeal(sharedMeal.id)}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    sharedMeal.isLiked 
                      ? 'text-red-500' 
                      : 'text-muted-foreground hover:text-red-500'
                  }`}
                >
                  <Heart size={16} fill={sharedMeal.isLiked ? 'currentColor' : 'none'} />
                  {sharedMeal.likes} J'aime
                </button>
                <button
                  onClick={() => handleAddComment(sharedMeal.id)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle size={16} />
                  {sharedMeal.comments.length} Commentaires
                </button>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Share2 size={16} />
                  Partager
                </button>
              </div>

              {/* Commentaires */}
              {sharedMeal.comments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  {sharedMeal.comments.slice(0, 2).map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <img
                        src={comment.user.profileImage}
                        alt={comment.user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-xs">
                          <span className="font-medium text-foreground">{comment.user.name}</span>
                          <span className="text-muted-foreground ml-2">{comment.text}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.timestamp).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {sharedMeal.comments.length > 2 && (
                    <button className="text-xs text-primary hover:underline">
                      Voir les {sharedMeal.comments.length - 2} autres commentaires
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
          
          {sharedMeals.length === 0 && (
            <div className="text-center py-8">
              <Users size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Aucun repas partagé pour le moment</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez des amis pour voir leurs repas !
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SocialFeed;