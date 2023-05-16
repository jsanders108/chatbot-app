import { Configuration, OpenAIApi } from "openai";
import { useState, useRef, useEffect } from "react";
import { logoImage } from "src/chatbot-logo.png";

function App() {
  const [promptInput, setPromptInput] = useState("");
  const [response, setResponse] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const chatbotConversation = useRef(null);
  const userInput = useRef(null);
  const api = import.meta.env.VITE_REACT_APP_CHATGPT_API;
  const configuration = new Configuration({
    apiKey: api
  });
  const openai = new OpenAIApi(configuration);

  useEffect(() => {
    if (questionCount >= 5) {
      userInput.current.disabled = true;
      userInput.current.placeholder = "You have reached the question limit.";
    }
  }, [questionCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (questionCount >= 5) {
      return;
    }

    const newPrompt = `${promptInput}\nResponse: ${response}\n`;
    const apiResponse = await openai.createCompletion({
      prompt: newPrompt,
      model: "text-davinci-003",
      temperature: 0,
      max_tokens: 1000,
    });
    const message = apiResponse.data.choices[0].text;
    setPromptInput("");
    setResponse(message);
    setQuestionCount((prevCount) => prevCount + 1);
    renderTypewriterText(message);
  };

  function renderTypewriterText(text) {
    const newSpeechBubble = document.createElement('div');
    newSpeechBubble.classList.add('speech', 'speech-ai', 'blinking-cursor');
    chatbotConversation.current.appendChild(newSpeechBubble);
    let i = 0;
    const interval = setInterval(() => {
      newSpeechBubble.textContent += text.slice(i-1, i);
      if (text.length === i) {
        clearInterval(interval);
        newSpeechBubble.classList.remove('blinking-cursor');
      }
      i++;
      chatbotConversation.current.scrollTop = chatbotConversation.current.scrollHeight;
    }, 50);
  }

  function renderUserInput() {
    const newSpeechBubble = document.createElement('div');
    newSpeechBubble.classList.add('speech', 'speech-human');
    chatbotConversation.current.appendChild(newSpeechBubble);
    newSpeechBubble.textContent = userInput.current.value;
    userInput.current.value = '';
    chatbotConversation.current.scrollTop = chatbotConversation.current.scrollHeight;
  }

  return (
    <div className="App">
      <main>
        <section className="chatbot-container">
          <div className="chatbot-header">
            <img src={logoImage} className="logo" alt="Chatbot Logo" />
            <h1>GPT-3 ChatBot</h1>
            <h2>Ask me anything!</h2>
          </div>
          <div className="speech speech-ai">
              How can I help you?
          </div>
          <div className="chatbot-conversation-container" ref={chatbotConversation} id="chatbot-conversation"></div>
          <form id="form" className="chatbot-input-container" onSubmit={handleSubmit}>
            <input 
              name="promptInput" 
              type="text"
              ref={userInput}
              value={promptInput} 
              id="user-input" 
              onChange={(e) => setPromptInput(e.target.value)}
            />
            <button
              id="submit-btn"
              className="submit-btn"
              onClick={renderUserInput}
              disabled={questionCount >= 5}
            >
              <img 
                src="src/send-btn-icon.png" 
                className="send-btn-icon"
                alt="Send Button"
              />
            </button>
          </form>
          <h3 className="disclaimer-1">*5 question limit (due to costs incurred using the ChatGPT API)</h3>
          {questionCount >= 5 && (
            <h3 className="disclaimer-2">You have reached the question limit (5 questions).</h3>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
