import React from "react";

type MainMenuProps = {
  onClassicClick?: () => void;
};

const MainMenu: React.FC<MainMenuProps> = ({ onClassicClick }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-blue-900 py-4">
      {/* Верхняя панель */}
      <div className="w-full flex items-center justify-between mt-2">
        <button className="bg-linear-to-br from-red-600 to-red-800 rounded-r-full w-14 h-12 flex items-center justify-center shadow-lg">
          {/* Магазин (иконка позже) */}
          <img src="/cart.svg" alt="Магазин" className="w-6 h-6" />
        </button>
        <button className=" font-figtree text-[4rem] font-black flex items-center justify-center text-white">
            ?
        </button>
        <button className="bg-blue-800 rounded-full w-10 h-10 flex items-center justify-center shadow">
          {/* Профиль */}
        </button>
      </div>

      {/* Кнопки режимов */}
      <div className="flex gap-4 mt-8">
        <button
          className="bg-blue-800 rounded-xl px-8 py-6 text-2xl font-bold text-yellow-300 shadow-lg"
          onClick={onClassicClick}
        >
          Classic
        </button>
        <button
          className="bg-blue-800 rounded-xl px-8 py-6 text-2xl font-bold text-yellow-300 shadow-lg"
          onClick={() => {}}
        >
          Zen
        </button>
      </div>

      {/* Плашка для миссий/информации */}
      <div className="w-11/12 h-16 bg-gray-200 rounded-lg mt-6 flex items-center justify-center text-gray-700 text-lg">
        {/* Здесь будет миссия или инфо */}
      </div>

      {/* Ежедневная награда */}
      <div className="flex flex-col items-center mt-8 mb-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-2">
          {/* Подарок (иконка позже) */}
        </div>
        <div className="bg-blue-800 rounded-lg px-4 py-2 text-white font-semibold mb-2">
          Ежедневная награда!
        </div>
        <button
          className="bg-red-600 rounded-lg px-8 py-2 text-white font-bold shadow"
          onClick={() => {}}
        >
          ЗАБРАТЬ
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
