import { Link } from "react-router-dom";
import { Button2 as Button } from "./Button";
import { Check, Mail, X } from "lucide-react";

type ModalSuccessProp = {
  email?: string;
  onOpen?: () => void | undefined;
  onClose?: () => void | undefined;
};
export const Modal = ({ ...props }: ModalSuccessProp) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={props.onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Compte créé avec succès !
          </h3>

          <p className="text-gray-600 mb-4">
            Votre compte RunWeek a été créé. Pour commencer à utiliser
            l'application, vous devez vérifier votre adresse email.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Mail className="h-5 w-5 text-blue-600 mr-2" />
              <p className="font-medium text-blue-800">
                Email de vérification envoyé
              </p>
            </div>
            <p className="text-sm text-blue-700">
              Nous avons envoyé un lien de vérification à :
            </p>
            <p className="font-medium text-blue-800 mt-1">{props.email}</p>
          </div>

          <div className="space-y-3 flex flex-col gap-2">
            <p className="text-sm text-gray-600">
              Vérifiez votre boîte de réception (et vos spams) puis cliquez sur
              le lien pour activer votre compte.
            </p>

            <Link to="/verify-mail">
              <Button className="w-full">Aller à la vérification email</Button>
            </Link>

            <Link to="/login">
              <Button variant="outline" className="w-full">
                Retour à la connexion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
