import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiSend, FiCpu, FiCalendar, FiZap, FiClock, FiMessageSquare } from 'react-icons/fi';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [schedule, setSchedule] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [workHours, setWorkHours] = useState(8);
  const [startTime, setStartTime] = useState('09:00');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: "👋 Hi! I'm TaskBot, your AI productivity assistant!\n\nI can help you:\n• 📊 Analyze your tasks and priorities\n• 📅 Create a daily schedule\n• ⏰ Suggest time allocations\n• 💡 Give productivity tips\n\nAsk me anything about managing your tasks!"
    }]);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const response = await aiAPI.chat(userMessage, conversationHistory);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.data.response 
      }]);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to get response';
      toast.error(errorMsg);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ ${errorMsg}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);

    try {
      const response = await aiAPI.analyze();
      setAnalysis(response.data.data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    setLoading(true);
    setSchedule(null);

    try {
      const response = await aiAPI.getSchedule(workHours, startTime);
      setSchedule(response.data.data);
      toast.success('Schedule generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate schedule');
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What should I focus on today?",
    "How to manage my high priority tasks?",
    "Give me productivity tips",
    "How many hours per task?"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center">
          <FiCpu className="w-8 h-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">AI Assistant</h1>
            <p className="text-purple-100">Powered by Groq LLaMA 3.3</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiMessageSquare /> Chat
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'analyze'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiZap /> Analyze Tasks
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'schedule'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiCalendar /> Generate Schedule
          </button>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="p-4">
            {/* Messages */}
            <div className="h-96 overflow-y-auto mb-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-bounce">🤔</div>
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="px-3 py-1 text-xs bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about your tasks..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="p-6">
            <div className="text-center mb-6">
              <FiZap className="w-12 h-12 mx-auto text-purple-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Task Analysis & Recommendations</h3>
              <p className="text-gray-500 text-sm">Get AI-powered insights on your tasks and productivity tips</p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? '🔄 Analyzing...' : '✨ Analyze My Tasks'}
            </button>

            {analysis && (
              <div className="mt-6 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{analysis.taskStats.highPriority}</p>
                    <p className="text-xs text-red-600">High Priority</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{analysis.taskStats.pending}</p>
                    <p className="text-xs text-yellow-600">Pending</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{analysis.taskStats.completed}</p>
                    <p className="text-xs text-green-600">Completed</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                    {analysis.response}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="p-6">
            <div className="text-center mb-6">
              <FiCalendar className="w-12 h-12 mx-auto text-purple-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">AI Schedule Generator</h3>
              <p className="text-gray-500 text-sm">Create a personalized daily timetable based on your tasks</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiClock className="inline w-4 h-4 mr-1" />
                  Work Hours
                </label>
                <select
                  value={workHours}
                  onChange={(e) => setWorkHours(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {[4, 5, 6, 7, 8, 9, 10, 12].map(h => (
                    <option key={h} value={h}>{h} hours</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateSchedule}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? '🔄 Generating...' : '📅 Generate My Schedule'}
            </button>

            {schedule && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    {schedule.totalTasks} tasks • {schedule.workHours} hours
                  </span>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                  {schedule.response}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
