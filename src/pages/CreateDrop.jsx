import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import BackButton from '@/components/ui/BackButton';
import { dropStore } from '@/features/drops/dropStore';
import { useTelegram } from '@/hooks/useTelegram';
import { Sparkles, Check, Plus, Trash2, ExternalLink } from 'lucide-react';
import OpenAI from 'openai';

// 🚀 Initialize high-speed Groq edge SDK engine
const groq = new OpenAI({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true 
});

export default function CreateDrop({ onNavigate }) {
  const { user, triggerHaptic } = useTelegram();
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  
  // Primary Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [winners, setWinners] = useState('');
  const [token, setToken] = useState('USDT'); 
  const [isMystery, setIsMystery] = useState(false);
  
  // Custom Merchant-Editable Trivia Gate States
  const [hasTrivia, setHasTrivia] = useState(false);
  const [triviaQuestion, setTriviaQuestion] = useState('');
  const [triviaOptions, setTriviaOptions] = useState(['', '']); 
  const [correctIndex, setCorrectIndex] = useState(0);

  const [isCreated, setIsCreated] = useState(false);
  const [createdDropRef, setCreatedDropRef] = useState(null);

  // 🧠 Real-Time Groq AI Contextual Campaign Engine
  const handleAiGeneration = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    triggerHaptic('impact');

    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are an expert Web3 conversion growth hacker. You must respond with a raw, valid JSON object matching this exact schema with absolutely no formatting, markdown code blocks, or conversational text outside the JSON parameters:
            {
              "title": "Short catchy headline string with an emoji",
              "description": "Clear verification steps string written contextually for claimers.",
              "amount": "Recommended total distribution pool size string (e.g., '150.00')",
              "winnersCount": "Recommended available claim slots string (e.g., '25')",
              "token": "Must be either 'USDT' or 'USDC' based on semantic indicators in the prompt (default to 'USDT')",
              "isMystery": true or false boolean based on if user implies gamified/random rewards or lootboxes,
              "hasTrivia": true or false boolean based on if user implies testing knowledge/quiz/questions,
              "trivia": {
                "question": "A custom, highly specific trivia question string related strictly to the context topic provided by the user.",
                "options": ["Choice A", "Choice B", "Choice C", "Choice D"],
                "correctIndex": 0, 1, 2, or 3 integer specifying the right option index placement
              }
            }`
          },
          {
            role: 'user',
            content: `Compile a custom micro-incentive campaign layer structure for this explicit intent string: "${aiPrompt}"`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const campaignData = JSON.parse(response.choices[0].message.content);

      // Hydrate primary web form configurations directly from the LLM return stream
      setTitle(campaignData.title || '');
      setDescription(campaignData.description || '');
      setAmount(campaignData.amount || '100.00');
      setWinners(campaignData.winnersCount || '20');
      setToken(campaignData.token === 'USDC' ? 'USDC' : 'USDT');
      setIsMystery(!!campaignData.isMystery);
      setHasTrivia(!!campaignData.hasTrivia);

      // Inject the context-specific trivia block array parameters if flagged true
      if (campaignData.hasTrivia && campaignData.trivia) {
        setTriviaQuestion(campaignData.trivia.question || '');
        setTriviaOptions(campaignData.trivia.options || ['', '']);
        setCorrectIndex(parseInt(campaignData.trivia.correctIndex, 10) || 0);
      }

      triggerHaptic('success');
    } catch (error) {
      console.error("Groq compilation failure:", error);
      triggerHaptic('warning');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Form Submission Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount || !winners) {
      triggerHaptic('warning');
      return;
    }

    const newDrop = dropStore.addDrop({
      title,
      description: description || "No campaign data provided by creator setup.",
      amount: parseFloat(amount).toFixed(2),
      winnersCount: parseInt(winners, 10),
      token, 
      isMystery,
      creator: user?.username || 'swift_merchant', 
      trivia: hasTrivia ? {
        question: triviaQuestion,
        options: triviaOptions.filter(opt => opt.trim() !== ''), 
        correctIndex: parseInt(correctIndex, 10)
      } : null
    });

    triggerHaptic('success');
    setCreatedDropRef(newDrop);
    setIsCreated(true);
  };

  const handleOptionChange = (index, value) => {
    const updated = [...triviaOptions];
    updated[index] = value;
    setTriviaOptions(updated);
  };

  const addOptionField = () => {
    if (triviaOptions.length < 4) {
      setTriviaOptions([...triviaOptions, '']);
    }
  };

  const removeOptionField = (index) => {
    if (triviaOptions.length > 2) {
      const updated = triviaOptions.filter((_, idx) => idx !== index);
      setTriviaOptions(updated);
      if (correctIndex >= updated.length) setCorrectIndex(0);
    }
  };

  // Success Confirmation Screen Canvas Layer
  if (isCreated) {
    const merchantHandle = user?.username ? `@${user.username}` : "Creator Profile";
    const merchantUid = user?.id || "SYSTEM_LOCAL";

    return (
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pt-6 space-y-6 animate-reveal text-zinc-100">
        
        <div className="text-center md:text-left space-y-2 pb-2 border-b border-white/5 flex flex-col md:flex-row md:items-center md:gap-4">
          <div className="w-12 h-12 bg-brand-success/10 border border-brand-success/30 rounded-full flex items-center justify-center mx-auto md:mx-0 text-brand-success shrink-0">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Campaign Initialized Successfully</h2>
            <p className="text-xs text-zinc-400">
              Settlement payload is live. Fund this campaign directly via SwiftyEx_bot to launch distribution channels.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          <div className="md:col-span-2 w-full space-y-4">
            
            <GlassCard className="bg-gradient-to-br from-zinc-950 to-zinc-900/40 border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <img 
                  src={user?.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
                  alt="Merchant Profile" 
                  className="h-9 w-9 rounded-full object-cover border border-zinc-800 shrink-0"
                />
                <div>
                  <span className="text-[9px] uppercase font-mono font-black tracking-widest text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2 py-0.5 rounded-md block w-max">
                    Authorized Creator
                  </span>
                  <p className="font-bold text-sm text-zinc-200 pt-0.5">{merchantHandle}</p>
                </div>
              </div>
              <div className="text-right font-mono text-[10px] text-zinc-500">
                <span>UID: {merchantUid}</span>
              </div>
            </GlassCard>

            <GlassCard className="bg-zinc-950/20 border-white/5 p-6 space-y-4 font-mono text-xs w-full rounded-2xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-zinc-500 font-sans font-bold uppercase tracking-wider">Campaign ID</span>
                <span className="text-zinc-300 text-sm select-all">{createdDropRef?.id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-zinc-500 font-sans font-bold uppercase tracking-wider">Active Reward Pool</span>
                <span className="text-brand-success text-sm font-black tracking-tight">{createdDropRef?.amount} {createdDropRef?.token}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-zinc-500 font-sans font-bold uppercase tracking-wider">Max Claims</span>
                <span className="text-zinc-100 text-sm font-bold">{createdDropRef?.winnersCount} Claim Slots</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-sans font-bold uppercase tracking-wider">Anti-Bot Gate</span>
                <span className="text-zinc-400 font-sans font-medium">{hasTrivia ? "🧠 Trivia Question Enabled" : "🔓 Public Access"}</span>
              </div>
            </GlassCard>
          </div>

          <div className="space-y-3 bg-zinc-900/20 border border-white/5 p-5 rounded-2xl w-full">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Execution Controls</span>
            <Button 
              onClick={() => window.open(`https://t.me/SwiftyEx_bot?start=${createdDropRef?.id}`, '_blank')}
              className="w-full relative overflow-hidden group py-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-accent to-blue-600 transition-all group-hover:opacity-90" />
              <span className="relative z-10 flex items-center justify-center gap-1.5 text-xs font-bold">
                ⚡ Fund via SwiftyEx_bot <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('home')} className="w-full bg-zinc-950 border border-white/5 text-xs font-bold hover:bg-zinc-900 py-3 text-zinc-300">
              Return to Dashboard
            </Button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-2 w-full max-w-3xl mx-auto px-4 md:px-6 animate-reveal">
      <BackButton onBack={() => onNavigate('home')} fallbackText="Back to Home" />
      
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Create Reward Drop</h2>
        <p className="text-xs text-zinc-400">Deploy high-engagement promotional micro-incentives natively.</p>
      </div>

      <GlassCard className="border-brand-accent/20 bg-zinc-950/10 space-y-3 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-accent uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" /> AI Campaign Prompt Copilot
        </div>
        <p className="text-xs text-zinc-400 leading-normal">
          Type an active phrase (e.g. "reward users in usdc for answering a solana question") and let the LPU map the form state instantly.
        </p>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="reward users with usdc for answering a solana quiz question..." 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 glass-input px-3 py-2.5 rounded-xl text-xs outline-none placeholder-zinc-600 text-white"
          />
          <button 
            type="button"
            onClick={handleAiGeneration}
            disabled={isAiGenerating}
            className="bg-brand-accent text-white rounded-xl px-4 text-xs font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center min-w-18.75 cursor-pointer"
          >
            {isAiGenerating ? "Processing..." : "Enter"}
          </button>
        </div>
      </GlassCard>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Campaign Headline" 
          placeholder="e.g. Welcome Incentive Pool" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
        <div className="w-full space-y-2 text-left">
          <label className="text-xs uppercase tracking-widest text-zinc-400 font-medium">Campaign Context Description</label>
          <textarea 
            rows={3}
            placeholder="Describe the qualification actions explicitly..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full glass-input px-4 py-3 rounded-xl text-white outline-none placeholder-zinc-600 text-sm resize-none border border-zinc-800 focus:border-zinc-700 bg-zinc-950/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* 💵 Capital Allocation Input wrapped inside an explicit relative positioning parent container */}
          <div className="relative flex flex-col justify-end w-full">
            <Input 
              label="Funding Capital Size" 
              type="number" 
              step="any"
              placeholder="100.00" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
              // 🚀 THE FIX: Extra inner padding space ensures inputs never slip underneath the selectors
              className="pr-28" 
            />
            
            {/* 🪙 High-Fidelity Multi-Token Pivot Group with concrete fixed size parameters to block line wrapping */}
            <div className="absolute right-2 bottom-1.5 flex items-center gap-1 bg-zinc-900/90 border border-white/5 p-1 rounded-xl h-9 z-10 shadow-lg backdrop-blur-sm w-[100px] justify-between">
              <button
                type="button"
                onClick={() => setToken('USDT')}
                className={`text-[9px] font-mono font-black w-[44px] py-1.5 rounded-lg transition-all cursor-pointer tracking-tight text-center select-none ${
                  token === 'USDT' 
                    ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/25' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                USDT
              </button>
              <button
                type="button"
                onClick={() => setToken('USDC')}
                className={`text-[9px] font-mono font-black w-[44px] py-1.5 rounded-lg transition-all cursor-pointer tracking-tight text-center select-none ${
                  token === 'USDC' 
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                USDC
              </button>
            </div>
          </div>

          <Input 
            label="Total Claim Slots" 
            type="number" 
            placeholder="50" 
            value={winners} 
            onChange={(e) => setWinners(e.target.value)} 
            required 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div onClick={() => { setIsMystery(!isMystery); triggerHaptic('impact'); }} className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${isMystery ? 'bg-amber-500/5 border-amber-500/30 text-white' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}>
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">🎰 Gamified Mystery Mechanism</div>
              <p className="text-[11px] text-zinc-400 leading-normal">Distribute random reward sizes to introduce a gaming layer and maximize community engagement.</p>
            </div>
            <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${isMystery ? 'bg-amber-500 border-amber-400 text-black' : 'border-zinc-700'}`}>{isMystery && <Check className="h-3.5 w-3.5 stroke-3" />}</div>
          </div>

          <div onClick={() => { setHasTrivia(!hasTrivia); triggerHaptic('impact'); }} className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${hasTrivia ? 'bg-brand-accent/5 border-brand-accent/30 text-white' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}>
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-accent">🧠 Trivia Gate Verification</div>
              <p className="text-[11px] text-zinc-400 leading-normal">Filter automated sybil bots by prompting claims with localized custom questions.</p>
            </div>
            <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${hasTrivia ? 'bg-brand-accent border-brand-accent text-white' : 'border-zinc-700'}`}>{hasTrivia && <Check className="h-3.5 w-3.5 stroke-3" />}</div>
          </div>
        </div>

        {/* --- LIVE TRIVIA SUBFORM CONFIGURATION --- */}
        {hasTrivia && (
          <GlassCard className="p-5 space-y-4 border-zinc-800 bg-zinc-950/40 w-full text-left rounded-2xl">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Verification Question</label>
              <input 
                type="text" 
                required={hasTrivia}
                placeholder="e.g., What layer does SwiftyEx_bot handle?"
                value={triviaQuestion} 
                onChange={(e) => setTriviaQuestion(e.target.value)}
                className="glass-input w-full p-3 rounded-xl text-xs font-medium text-white focus:outline-none border border-zinc-800 focus:border-zinc-700 bg-zinc-950/40"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Multiple Choice Options (Max 4)</label>
                {triviaOptions.length < 4 && (
                  <button 
                    type="button" 
                    onClick={addOptionField}
                    className="text-[10px] font-bold text-brand-accent flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Choice
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {triviaOptions.map((option, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-zinc-900/20 border border-white/5 p-2 rounded-xl">
                    <input 
                      type="radio" 
                      name="correctAnswer" 
                      checked={correctIndex === idx} 
                      onChange={() => setCorrectIndex(idx)} 
                      className="w-4 h-4 accent-brand-accent cursor-pointer shrink-0 ml-1" 
                    />
                    <input 
                      type="text" 
                      required={hasTrivia}
                      placeholder={`Choice #${idx + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="glass-input flex-1 p-2 rounded-lg text-xs font-medium text-white focus:outline-none border border-zinc-800 focus:border-zinc-700 bg-zinc-950/40"
                    />
                    {triviaOptions.length > 2 && (
                      <button 
                        type="button"
                        onClick={() => removeOptionField(idx)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        <div className="pt-2">
          <Button type="submit" className="w-full font-bold py-3 text-sm">
            Generate Campaign
          </Button>
        </div>
      </form>
    </div>
  );
}