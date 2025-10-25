import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userProject, setUserProject] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen && conversation.length === 0) {
      setTimeout(() => {
        addMessage('bot', 'Zdravo! 👋 Ja sam NIDZP Design asistent. Kako se zovete?');
      }, 500);
    }
  }, [isOpen]);

  const addMessage = (sender, text) => {
    setConversation(prev => [...prev, { sender, text, timestamp: new Date() }]);
  };

  const simulateTyping = (callback, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleNameSubmit = (name) => {
    if (!name.trim()) return;
    
    setUserName(name);
    addMessage('user', name);
    
    simulateTyping(() => {
      addMessage('bot', `Drago mi je ${name}! 😊 Možete li mi reći vašu email adresu?`);
      setStep(2);
    });
  };

  const handleEmailSubmit = (email) => {
    if (!email.trim() || !email.includes('@')) {
      simulateTyping(() => {
        addMessage('bot', 'Molim vas unesite validnu email adresu.');
      }, 500);
      return;
    }
    
    setUserEmail(email);
    addMessage('user', email);
    
    simulateTyping(() => {
      addMessage('bot', 'Super! 🎯 Opišite ukratko vaš projekat ili kako vam mogu pomoći?');
      setStep(3);
    });
  };

  const handleProjectSubmit = (project) => {
    if (!project.trim()) return;
    
    setUserProject(project);
    addMessage('user', project);
    
    simulateTyping(() => {
      addMessage('bot', 'Hvala vam! 🙏 Kontaktiraću vas uskoro na ' + userEmail + '. Vaš projekat zvuči interesantno!');
      setStep(4);
      
      // Send email via EmailJS
      sendEmail(userName, userEmail, project);
    }, 1500);
  };

  const sendEmail = (name, email, project) => {
    // EmailJS configuration
    const serviceID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
    const templateID = 'YOUR_TEMPLATE_ID'; // Replace with your EmailJS template ID
    const publicKey = 'YOUR_PUBLIC_KEY'; // Replace with your EmailJS public key

    const templateParams = {
      from_name: name,
      from_email: email,
      message: project,
      to_email: 'nikola.djokic@gmail.com'
    };

    emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then((response) => {
        console.log('Email sent successfully!', response.status, response.text);
      })
      .catch((error) => {
        console.error('Failed to send email:', error);
        // Fallback: You could show an error message to the user
        addMessage('bot', 'Došlo je do greške pri slanju. Molim vas kontaktirajte direktno na nikola.djokic@gmail.com');
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements.message;
    const value = input.value;

    if (step === 1) {
      handleNameSubmit(value);
    } else if (step === 2) {
      handleEmailSubmit(value);
    } else if (step === 3) {
      handleProjectSubmit(value);
    }

    input.value = '';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">NIDZP Design</h3>
              <p className="text-sm opacity-90">Uvek tu za vas</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close chat"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          {step < 4 && (
            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="message"
                  placeholder={
                    step === 1
                      ? 'Vaše ime...'
                      : step === 2
                      ? 'Vaš email...'
                      : 'Opišite projekat...'
                  }
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg px-4 py-2 hover:shadow-lg transition-shadow"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
