export default function NotFound() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 text-center">
			<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Страница не найдена</h1>
			<p className="text-gray-500 dark:text-gray-400 text-sm">Такой страницы не существует.</p>
			<a href="/"
			   className="mt-6 px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
				На главную
			</a>
		</div>
	);
}