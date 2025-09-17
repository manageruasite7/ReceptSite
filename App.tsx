
import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

// --- DATA & TRANSLATIONS ---
const constants = {
  languages: {
    ru: 'Русский',
    uk: 'Українська'
  },
  translations: {
    ru: {
      title: 'AI Генератор Рецептов',
      subtitle: 'Создайте кулинарный шедевр из того, что у вас есть',
      ingredientsLabel: 'Ингредиенты',
      ingredientsPlaceholder: 'Введите ингредиенты через запятую (например, курица, картофель, сливки)',
      mealTypeLabel: 'Прием пищи',
      dishTypeLabel: 'Тип блюда',
      cuisineLabel: 'Кухня мира',
      occasionLabel: 'Особый случай',
      generateButton: 'Сгенерировать рецепт',
      generating: 'Создаем шедевр...',
	  errorOverloaded: 'Серверы Google перегружены. Пожалуйста, попробуйте сгенерировать рецепт чуть позже.',
      errorOccurred: 'Произошла ошибка. Попробуйте изменить запрос.',
      loadingMessages: [
        'Разогреваем духовку...',
        'Нарезаем овощи...',
        'Подбираем идеальные специи...',
        'Взбиваем соус...',
        'Сервируем блюдо...',
      ],
      recipe: 'Ваш рецепт',
      ingredientsHeader: 'Ингредиенты:',
      instructionsHeader: 'Инструкция приготовления:',
      savePdf: 'Сохранить в PDF',
      share: 'Поделиться:',
      shareText: 'Смотрите, какой рецепт я сгенерировал!',
	  telegram: 'Сохранить PDF файл для отправки в Telegram',
    },
    uk: {
      title: 'AI Генератор Рецептів',
      subtitle: 'Створіть кулінарний шедевр з того, що у вас є',
      ingredientsLabel: 'Інгредієнти',
      ingredientsPlaceholder: 'Введіть інгредієнти через кому (наприклад, курка, картопля, вершки)',
      mealTypeLabel: 'Прийом їжі',
      dishTypeLabel: 'Тип страви',
      cuisineLabel: 'Кухня світу',
      occasionLabel: 'Особливий випадок',
      generateButton: 'Згенерувати рецепт',
      generating: 'Створюємо шедевр...',
	  errorOverloaded: 'Сервери Google перевантажені. Будь ласка, спробуйте згенерувати рецепт трохи пізніше.',
      errorOccurred: 'Сталася помилка. Спробуйте змінити запит.',
      loadingMessages: [
        'Розігріваємо духовку...',
        'Нарізаємо овочі...',
        'Підбираємо ідеальні спеції...',
        'Збиваємо соус...',
        'Сервіруємо страву...',
      ],
      recipe: 'Ваш рецепт',
      ingredientsHeader: 'Інгредієнти:',
      instructionsHeader: 'Інструкція приготування:',
      savePdf: 'Зберегти в PDF',
      share: 'Поділитися:',
      shareText: 'Дивіться, який рецепт я згенерував!',
      telegram: 'Зберегти PDF файл для відправки в Telegram',
    },
  },
  mealTypes: {
    ru: ['Любой', 'Завтрак', 'Второй завтрак', 'Обед', 'Полдник', 'Ужин', 'Поздний ужин'],
    uk: ['Будь-який', 'Сніданок', 'Другий сніданок', 'Обід', 'Полуденок', 'Вечеря', 'Пізня вечеря'],
  },
  dishTypes: {
    ru: ['Любой', 'Закуска', 'Салат', 'Суп', 'Основное блюдо', 'Гарнир', 'Десерт', 'Выпечка', 'Напиток'],
    uk: ['Будь-який', 'Закуска', 'Салат', 'Суп', 'Основна страва', 'Гарнір', 'Десерт', 'Випічка', 'Напій'],
  },
  occasions: {
    ru: ['Любой', 'Быстрое приготовление', 'Романтический ужин', 'Быстрые закуски', 'Для компании друзей', 'Для пикника'],
    uk: ['Будь-який', 'Швидке приготування', 'Романтична вечеря', 'Швидкі закуски', 'Для компанії друзів', 'Для пікніка'],
  },
  cuisines: {
    ru: ['Любая', 'Абхазская', 'Австралийская', 'Австрийская', 'Азербайджанская', 'Азиатская', 'Американская', 'Английская', 'Арабская', 'Аргентинская', 'Армянская', 'Африканская', 'Белорусская', 'Бельгийская', 'Болгарская', 'Бразильская', 'Венгерская', 'Восточная', 'Вьетнамская', 'Голландская', 'Греческая', 'Грузинская', 'Датская', 'Еврейская', 'Египетская', 'Индийская', 'Ирландская', 'Испанская', 'Итальянская', 'Кавказская', 'Казахская', 'Канадская', 'Китайская', 'Корейская', 'Кубинская', 'Марокканская', 'Мексиканская', 'Молдавская', 'Немецкая', 'Норвежская', 'Польская', 'Португальская', 'Русская', 'Скандинавская', 'Средиземноморская', 'Тайская', 'Татарская', 'Турецкая', 'Узбекская', 'Украинская', 'Финская', 'Французская', 'Чешская', 'Швейцарская', 'Шведская', 'Японская'],
    uk: ['Будь-яка', 'Абхазька', 'Австралійська', 'Австрійська', 'Азербайджанська', 'Азіатська', 'Американська', 'Англійська', 'Арабська', 'Аргентинська', 'Вірменська', 'Африканська', 'Білоруська', 'Бельгійська', 'Болгарська', 'Бразильська', 'Угорська', 'Східна', 'В\'єтнамська', 'Голландська', 'Грецька', 'Грузинська', 'Данська', 'Єврейська', 'Єгипетська', 'Індійська', 'Ірландська', 'Іспанська', 'Італійська', 'Кавказька', 'Казахська', 'Канадська', 'Китайська', 'Корейська', 'Кубинська', 'Марокканська', 'Мексиканська', 'Молдавська', 'Німецька', 'Норвезька', 'Польська', 'Португальська', 'Російська', 'Скандинавська', 'Середземноморська', 'Тайська', 'Татарська', 'Турецька', 'Узбецька', 'Українська', 'Фінська', 'Французька', 'Чеська', 'Швейцарська', 'Шведська', 'Японська'],
  }
};

// --- TYPE DEFINITIONS ---
interface Recipe {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  imagePrompt: string;
  imageUrl?: string;
}

// --- SVG ICONS ---
const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ShareIcon = ({ platform }: { platform: string }) => {
    const paths: { [key: string]: string } = {
        viber: "M15.908 2.092c-2.342 0-4.03.35-5.592 1.054C7.03.22 4.195-1.12.92 1.134-.14 2.14 0 5.03 0 5.03c2.483-1.63 4.195-1.4 5.362-.64C4.195 6.113 4.1 8.82 5.92 11.23c1.728 2.228 4.414 4.15 6.42 4.15 1.054 0 2.052-.375 2.872-1.134 2.14-1.923.823-7.514-.85-9.334-.73-1.84-1.96-2.84-2.455-2.84z",
        telegram: "M9.78 18.39c.33 0 .5-.14.7-.33l2.2-2.14 4.55 3.37c.8.48 1.37.23 1.57-.7L24 4.45c.22-1.05-.4-1.55-1.14-1.28L2.13 9.4c-1.04.42-1.03 1.02-.18 1.28l5.1 1.59 11.96-7.52c.57-.35 1.1-.16.65.22L8.5 16.03l-.42 5.27c1 .01 1.43-.48 1.7-1.91z",
        whatsapp: "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.46 3.48 1.34 4.94L2 22l5.3-1.48c1.4.78 2.97 1.2 4.65 1.2 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM18.4 16.2c-.2-.1-.72-.35-1.18-.55-.46-.2-1.03-.6-1.18-.75-.16-.15-.46-.25-.6-.25s-.45.2-.74.6c-.29.4-.98 1.2-1.2 1.45s-.3.15-.45 0c-.15-.15-1.12-.5-2.2-1.3-.85-.6-1.5-1.4-1.65-1.7-.15-.3-.3-1.05.3-1.35.4-.3.75-.8.9-1.05.15-.25.15-.45 0-.6-.15-.15-.3-.3-.45-.45s-.45-.15-.6-.15-.45-.15-.6-.15-1.05.45-1.2.6c-.15.15-.6.75-.6 1.8 0 1.05.6 2.1 1.35 3.15s1.8 1.8 4.2 2.55c.6.2.9.3.9.45.15.15.15.6.15.75 0 .15-.15.3-.3.45z",
        facebook: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z",
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox={platform === 'telegram' ? "0 0 24 24" : "0 0 24 24"} fill="currentColor">
            <path d={paths[platform]}></path>
        </svg>
    );
};


// --- MAIN APP COMPONENT ---
export default function App() {
    const [language, setLanguage] = useState<'ru' | 'uk'>('ru');
    const [ingredients, setIngredients] = useState('');
    const [mealType, setMealType] = useState('Любой');
    const [dishType, setDishType] = useState('Любой');
    const [cuisine, setCuisine] = useState('Любая');
    const [occasion, setOccasion] = useState('Любой');
    
    const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    
    const t = useMemo(() => constants.translations[language], [language]);

    useEffect(() => {
        // Fix: Replaced NodeJS.Timeout with a browser-compatible type for the interval handle.
        let interval: ReturnType<typeof setInterval>;
        if (isLoading) {
          setLoadingMessage(t.loadingMessages[0]);
          interval = setInterval(() => {
            setLoadingMessage(prev => {
              const currentIndex = t.loadingMessages.indexOf(prev);
              const nextIndex = (currentIndex + 1) % t.loadingMessages.length;
              return t.loadingMessages[nextIndex];
            });
          }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading, t.loadingMessages]);

    const handleLanguageChange = (lang: 'ru' | 'uk') => {
        setLanguage(lang);
        setMealType(constants.mealTypes[lang][0]);
        setDishType(constants.dishTypes[lang][0]);
        setCuisine(constants.cuisines[lang][0]);
        setOccasion(constants.occasions[lang][0]);
    };

    const handleGenerateRecipe = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setGeneratedRecipe(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string });

            const schema = {
              type: Type.OBJECT,
              properties: {
                recipeName: { type: Type.STRING },
                description: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                imagePrompt: { type: Type.STRING },
              },
              required: ['recipeName', 'description', 'ingredients', 'instructions', 'imagePrompt'],
            };
            
            const langName = language === 'ru' ? 'русском' : 'украинском';
            const prompt = `
              Создай кулинарный рецепт на ${langName} языке.
              Параметры:
              - Ингредиенты: ${ingredients || 'любые'}
              - Тип приема пищи: ${mealType === constants.mealTypes[language][0] ? 'любой' : mealType}
              - Тип блюда: ${dishType === constants.dishTypes[language][0] ? 'любой' : dishType}
              - Кухня: ${cuisine === constants.cuisines[language][0] ? 'любая' : cuisine}
              - Повод: ${occasion === constants.occasions[language][0] ? 'любой' : occasion}
  
              Рецепт должен содержать название, краткое описание, список ингредиентов и пошаговую инструкцию.
              ВАЖНО: Верни ответ только в формате JSON, соответствующем этой схеме.
              Также, создай краткий, яркий и детальный промпт на английском языке для генерации фотореалистичного изображения готового блюда в поле 'imagePrompt'. Промпт должен описывать блюдо на тарелке, с красивой подачей, подходящим фоном и освещением в стиле кулинарного минимализма.
            `;

            const textResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                },
            });
            
            const recipeData = JSON.parse(textResponse.text) as Recipe;

            /*const imageResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: recipeData.imagePrompt,
                config: { numberOfImages: 1, aspectRatio: '4:3' }
            });

            const imageUrl = `data:image/png;base64,${imageResponse.generatedImages[0].image.imageBytes}`;
            */
			setGeneratedRecipe(recipeData); 
			
        } catch (err) {
            console.error(err);
            // Проверяем, содержит ли текст ошибки слово "overloaded"
            if (String(err).includes('overloaded')) {
                setError(t.errorOverloaded); // Показываем нашу новую, кастомную ошибку
            } else {
                setError(t.errorOccurred); // Для всех других проблем показываем стандартную ошибку
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePrint = () => window.print();

	/*
	const handleShare = (platform: 'viber' | 'telegram' | 'whatsapp' | 'facebook') => {
        if (!generatedRecipe) return;
        
        const pageUrl = window.location.href;
        const shareText = encodeURIComponent(`${t.shareText} "${generatedRecipe.recipeName}"`);
        const shareUrl = encodeURIComponent(pageUrl);

        let url = '';
        switch(platform) {
            case 'viber':
                url = `viber://forward?text=${shareText}%0A${shareUrl}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
                break;
            case 'whatsapp':
                url = `https://api.whatsapp.com/send?text=${shareText}%0A${shareUrl}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
                break;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    }; */

    return (
        <div className="min-h-screen container mx-auto px-4 py-8">
            <header className="text-center mb-8 no-print">
                <div className="flex justify-center items-center gap-4 mb-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-stone-800">{t.title}</h1>
                    <div className="flex gap-2">
                        <button onClick={() => handleLanguageChange('ru')} className={`px-2 py-1 text-sm rounded-md ${language === 'ru' ? 'bg-stone-800 text-white' : 'bg-stone-200'}`}>RU</button>
                        <button onClick={() => handleLanguageChange('uk')} className={`px-2 py-1 text-sm rounded-md ${language === 'uk' ? 'bg-stone-800 text-white' : 'bg-stone-200'}`}>UK</button>
                    </div>
                </div>
                <p className="text-stone-600">{t.subtitle}</p>
            </header>

            <main className="max-w-4xl mx-auto">
                <form onSubmit={handleGenerateRecipe} className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 space-y-4 no-print">
                    <div>
                        <label htmlFor="ingredients" className="block text-sm font-medium text-stone-700 mb-1">{t.ingredientsLabel}</label>
                        <textarea id="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={3}
                            className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                            placeholder={t.ingredientsPlaceholder}></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="mealType" className="block text-sm font-medium text-stone-700 mb-1">{t.mealTypeLabel}</label>
                            <select id="mealType" value={mealType} onChange={(e) => setMealType(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition bg-white">
                                {constants.mealTypes[language].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dishType" className="block text-sm font-medium text-stone-700 mb-1">{t.dishTypeLabel}</label>
                            <select id="dishType" value={dishType} onChange={(e) => setDishType(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition bg-white">
                                {constants.dishTypes[language].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="cuisine" className="block text-sm font-medium text-stone-700 mb-1">{t.cuisineLabel}</label>
                            <select id="cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition bg-white">
                                {constants.cuisines[language].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="occasion" className="block text-sm font-medium text-stone-700 mb-1">{t.occasionLabel}</label>
                            <select id="occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition bg-white">
                                {constants.occasions[language].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading}
                        className="w-full flex justify-center items-center bg-amber-600 text-white font-bold py-3 px-4 rounded-md hover:bg-amber-700 transition duration-300 disabled:bg-amber-400 disabled:cursor-not-allowed">
                        {isLoading ? <><LoadingSpinner /> {loadingMessage}</> : t.generateButton}
                    </button>
                </form>

                <div className="mt-8">
                    {error && <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">{error}</div>}

                    {generatedRecipe && (
                        <article className="bg-white p-6 md:p-8 rounded-lg shadow-lg border border-stone-200 print-container">
                            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-stone-800">{generatedRecipe.recipeName}</h2>
                            <p className="text-stone-600 mb-6 italic">{generatedRecipe.description}</p>
                            
                            {generatedRecipe.imageUrl && (
                                <img src={generatedRecipe.imageUrl} alt={generatedRecipe.recipeName} className="w-full h-auto object-cover rounded-lg mb-6 shadow-md" />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-1 print-break-inside-avoid">
                                    <h3 className="text-2xl font-bold mb-4 text-stone-800">{t.ingredientsHeader}</h3>
                                    <ul className="list-disc list-inside space-y-2 text-stone-700">
                                        {generatedRecipe.ingredients.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className="md:col-span-2">
                                    <h3 className="text-2xl font-bold mb-4 text-stone-800">{t.instructionsHeader}</h3>
                                    <ol className="list-decimal list-inside space-y-4 text-stone-700">
                                        {generatedRecipe.instructions.map((step, index) => (
                                            <li key={index} className="pl-2 leading-relaxed">{step}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 no-print">
                                <button onClick={handlePrint} className="bg-stone-700 text-white font-medium py-2 px-4 rounded-md hover:bg-stone-800 transition">{t.savePdf}</button>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-stone-600">{t.share}</span>
                                    <div className="flex gap-2">
									  <button title={t.telegram} onClick={handlePrint} className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 transition"><ShareIcon platform="telegram"/></button>
									</div>
                                </div>
                            </div>
                        </article>
                    )}
                </div>
            </main>
        </div>
    );
}