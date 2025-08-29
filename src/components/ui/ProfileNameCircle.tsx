import { FC } from "react";

export const ProfileNameCircle: FC<{ name: string, radius: number }> = ({ name, radius = 24 }) => {

  return <div className={`w-${radius} h-${radius} rounded-full border-4 border-white dark:border-gray-700 shadow-sm bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center`}>
    <span className="text-white text-md font-semibold">
      {name}
    </span>
  </div>;
}