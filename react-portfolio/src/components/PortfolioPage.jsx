import ChatWidget from './ChatWidget';

const PortfolioPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            NIDZP Design
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Profile Section */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              ND
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Nikola Djokic</h2>
              <p className="text-xl text-gray-600 mb-4">Full-Stack Developer & Designer</p>
              <p className="text-gray-600 leading-relaxed">
                Kreiram moderna web rešenja koja spajaju dizajn i funkcionalnost. 
                Specijalizovan za React, Node.js, i AI integracije. Sa iskustvom u video produkciji 
                i digital marketingu, donosim holistički pristup svakom projektu.
              </p>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Radno Iskustvo
          </h3>
          
          <div className="space-y-6">
            {/* Experience Item 1 */}
            <div className="border-l-4 border-purple-600 pl-6">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-semibold text-gray-800">Web Developer & Designer</h4>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">2022 - 2024</span>
              </div>
              <p className="text-gray-600 mb-2">Freelance / NIDZP Design</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Razvoj modernih web aplikacija sa React i Node.js</li>
                <li>Integracija AI chatbot-ova i automatizacija procesa</li>
                <li>UI/UX dizajn i responsive frontend development</li>
                <li>SEO optimizacija i performanse</li>
              </ul>
            </div>

            {/* Experience Item 2 */}
            <div className="border-l-4 border-blue-600 pl-6">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-semibold text-gray-800">Video Production & Marketing Specialist</h4>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">2020 - 2022</span>
              </div>
              <p className="text-gray-600 mb-2">Freelance / Razni Klijenti</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Video produkcija i post-produkcija (Adobe Premiere, After Effects)</li>
                <li>Social media marketing i content creation</li>
                <li>Brand identity i grafički dizajn (Canva, Photoshop)</li>
                <li>Digital marketing strategije i kampanje</li>
              </ul>
            </div>

            {/* Experience Item 3 */}
            <div className="border-l-4 border-indigo-600 pl-6">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-semibold text-gray-800">Freelance Creative & Designer</h4>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">2018 - 2023</span>
              </div>
              <p className="text-gray-600 mb-2">Freelance / Upwork, Fiverr, Lokalni Klijenti</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Preko 100+ završenih projekata za klijente širom sveta</li>
                <li>Web dizajn, grafički dizajn, logo design</li>
                <li>Video editing i motion graphics</li>
                <li>Consulting za digitalni marketing i branding</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Veštine
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'React.js',
              'Node.js',
              'JavaScript (ES6+)',
              'HTML5 / CSS3',
              'Tailwind CSS',
              'Vite / Webpack',
              'Git / GitHub',
              'RESTful APIs',
              'AI Integration (OpenAI, Groq)',
              'Adobe Premiere Pro',
              'Canva / Photoshop',
              'SEO & Analytics'
            ].map((skill, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg px-4 py-3 text-center hover:shadow-md transition-shadow"
              >
                <span className="text-gray-700 font-medium">{skill}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Kontakt
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a href="mailto:nikola.djokic@gmail.com" className="text-gray-800 hover:text-purple-600 transition-colors">
                  nikola.djokic@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lokacija</p>
                <p className="text-gray-800">Sombor, Serbia</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <p className="text-gray-700 text-center">
              💬 Imate projekat? Kliknite na chat ikonicu u donjem desnom uglu i razgovarajmo!
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-gray-600">
          <p>&copy; 2024 NIDZP Design. Sva prava zadržana.</p>
        </div>
      </footer>

      {/* ChatWidget */}
      <ChatWidget />
    </div>
  );
};

export default PortfolioPage;
