import { FC } from "react";
import { motion } from "framer-motion";
import Card from "../../../components/ui/Card";
import { FileText, ExternalLink, MessageSquare, HelpCircle } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useUserContext } from "../../../hooks/useUser";

export const SupportTab: FC = () => {

  const { user } = useUserContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card title="Centre d'aide" className="bg-card text-card-foreground border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Ressources</h4>
            <div className="space-y-3">
              <button className="w-full p-3 text-left border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Guide d'utilisation</p>
                    <p className="text-sm text-muted-foreground">Apprenez à utiliser toutes les fonctionnalités</p>
                  </div>
                  <ExternalLink size={14} className="ml-auto text-muted-foreground" />
                </div>
              </button>
              <button className="w-full p-3 text-left border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-primary" />
                  <div>
                    <p className="font-medium text-foreground">FAQ</p>
                    <p className="text-sm text-muted-foreground">Réponses aux questions fréquentes</p>
                  </div>
                  <ExternalLink size={14} className="ml-auto text-muted-foreground" />
                </div>
              </button>
              <button className="w-full p-3 text-left border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle size={18} className="text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Contacter le support</p>
                    <p className="text-sm text-muted-foreground">Obtenez de l'aide personnalisée</p>
                  </div>
                  <ExternalLink size={14} className="ml-auto text-muted-foreground" />
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Informations système</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version de l'app</span>
                <span className="font-medium text-foreground">2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dernière mise à jour</span>
                <span className="font-medium text-foreground">20/01/2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plateforme</span>
                <span className="font-medium text-foreground">Web</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID utilisateur</span>
                <span className="font-medium text-foreground font-mono text-xs">{user?.id}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Feedback */}
      <Card title="Votre avis compte" className="bg-card text-card-foreground border-border">
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Aidez-nous à améliorer Runweek en partageant vos commentaires
          </p>
          <textarea
            placeholder="Partagez vos suggestions, signaler un bug, ou dites-nous ce que vous aimez..."
            className="input w-full h-24 resize-none"
          />
          <div className="flex gap-3">
            <Button className="flex-1">
              Envoyer un commentaire
            </Button>
            <Button variant="outline" className="flex-1">
              Signaler un problème
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}