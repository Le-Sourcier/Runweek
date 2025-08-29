import { FC } from "react";
import { motion } from "framer-motion";
import Card from "../../../components/ui/Card";
import { CheckCircle, Plus, CreditCard as CardIcon, Download, } from "lucide-react";
import Button from "../../../components/ui/Button";

export const BillingTab: FC = () => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card title="Abonnement actuel" className="bg-card text-card-foreground border-border">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div>
              <h4 className="font-semibold text-foreground">Plan Premium</h4>
              <p className="text-sm text-muted-foreground">Accès complet à toutes les fonctionnalités</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-foreground">9,99€/mois</p>
              <p className="text-xs text-muted-foreground">Renouvelé le 25/02/2025</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-background rounded-lg border border-border">
              <CheckCircle size={24} className="mx-auto text-green-500 mb-2" />
              <p className="text-sm font-medium text-foreground">Coach IA illimité</p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg border border-border">
              <CheckCircle size={24} className="mx-auto text-green-500 mb-2" />
              <p className="text-sm font-medium text-foreground">Analyses avancées</p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg border border-border">
              <CheckCircle size={24} className="mx-auto text-green-500 mb-2" />
              <p className="text-sm font-medium text-foreground">Synchronisation multi-appareils</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              Changer de plan
            </Button>
            <Button variant="destructive" className="flex-1">
              Annuler l'abonnement
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment Methods */}
      <Card title="Méthodes de paiement" className="bg-card text-card-foreground border-border">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <CardIcon size={20} className="text-primary" />
              <div>
                <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expire 12/2027</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Modifier</Button>
              <Button variant="destructive">Supprimer</Button>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            <Plus size={16} className="mr-2" />
            Ajouter une méthode de paiement
          </Button>
        </div>
      </Card>

      {/* Billing History */}
      <Card title="Historique de facturation" className="bg-card text-card-foreground border-border">
        <div className="space-y-3">
          {[
            { date: '2025-01-20', amount: '9,99€', status: 'Payé', invoice: 'INV-2025-001' },
            { date: '2024-12-20', amount: '9,99€', status: 'Payé', invoice: 'INV-2024-012' },
            { date: '2024-11-20', amount: '9,99€', status: 'Payé', invoice: 'INV-2024-011' },
          ].map((bill, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">{bill.invoice}</p>
                <p className="text-sm text-muted-foreground">{bill.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-foreground">{bill.amount}</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {bill.status}
                </span>
                <Button variant="outline">
                  <Download size={14} className="mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}