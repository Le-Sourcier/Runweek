import { Puzzle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../hooks/useAppNavigation';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <div className="text-center">
        <Puzzle
          className="mx-auto h-24 w-24 text-blue-500"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-6xl font-bold text-gray-900 dark:text-white">
          404
        </h1>
        <p className="mt-4 text-2xl font-light">Page non trouvée</p>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to={ROUTES.WELCOME}
          className="mt-6 inline-block rounded-md bg-primary dark:bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-blue-600 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;