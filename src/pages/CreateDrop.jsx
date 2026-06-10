import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import BackButton from '@/components/ui/BackButton';
import { dropStore } from '@/features/drops/dropStore';
import { dropApi } from '@/services/dropApi'; // 🚀 IMPORTED FOR SIMULATION HOOKS
import { useTelegram } from '@/hooks/useTelegram';
import { Sparkles, Check, Plus, Trash2, ExternalLink } from 'lucide-react';
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true 
});

export default function CreateDrop({ onNavigate }) {
  const { user, triggerHaptic } = useTelegram();
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [winners, setWinners] = useState('');
  const [token, setToken] = useState('USDT'); 
  const [isMystery, setIsMystery] = useState(false);
  const [communityUrl, setCommunityUrl] = useState('');

  const [hasTrivia, setHasTrivia] = useState(false);
  const [triviaQuestion, setTriviaQuestion] = useState('');
  const [triviaOptions, setTriviaOptions] = useState(['', '']); 
  const [correctIndex, setCorrectIndex] = useState(0);

  const [isCreated, setIsCreated] = useState(false);
  const [createdDropRef, setCreatedDropRef] = useState(null);

  // ⚡ FUNDING SIMULATION STATES
  const [simState, setSimState] = useState('idle'); // 'idle' | 'connecting' | 'fetching' | 'success'
  const [simAddress, setSimAddress] = useState('');
  const [simStatusText, setSimStatusText] = useState('');

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
            content: `You are an expert Web3 conversion growth hacker. You must respond with a raw, valid JSON object matching this exact schema:
            {
              "title": "Short catchy headline string with an emoji",
              "description": "A punchy, high-converting, single-paragraph campaign call-to-action without markdown points or step indicators.",
              "amount": "150.00",
              "winnersCount": "25",
              "token": "USDT",
              "isMystery": false,
              "hasTrivia": false,
              "trivia": {
                "question": "Trivia question text?",
                "options": ["Ans A", "Ans B", "Ans C", "Ans D"],
                "correctIndex": 0
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

      setTitle(campaignData.title || '');
      setDescription(campaignData.description || '');
      setAmount(campaignData.amount || '100.00');
      setWinners(campaignData.winnersCount || '20');
      setToken(campaignData.token === 'USDC' ? 'USDC' : 'USDT');
      setIsMystery(!!campaignData.isMystery);
      setHasTrivia(!!campaignData.hasTrivia);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !winners) {
      triggerHaptic('warning');
      return;
    }

    const newDrop = await dropStore.addDrop({
      title,
      description: description || "No campaign data provided by creator setup.",
      amount: parseFloat(amount).toFixed(2),
      winnersCount: parseInt(winners, 10),
      token, 
      isMystery,
      communityUrl: communityUrl.trim() || "https://t.me/swift_dropbot",
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

  if (isCreated) {
    const merchantHandle = user?.username ? `@${user.username}` : "Creator Profile";
    const merchantUid = user?.id || "SYSTEM_LOCAL";

    return (
      <div className="w-full max-w-md md:max-w-2xl mx-auto px-4 pt-3 space-y-5 animate-reveal text-zinc-100 text-left">
        <div className="flex items-center gap-3 border-b border-zinc-900 pb-3">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-white">Campaign Active</h2>
            <p className="text-[11px] text-zinc-500 font-medium">Fund via SwiftyEx_bot.</p>
          </div>
        </div>

        <GlassCard className="bg-zinc-950/20 p-4 space-y-3.5 font-mono text-xs rounded-xl border border-white/5">
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <span className="text-zinc-500 font-sans font-bold uppercase tracking-wider text-[10px]">Campaign ID</span>
            <span className="text-zinc-300 select-all font-bold">{createdDropRef?.id}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <span className="text-zinc-500 font-sans font-bold uppercase tracking-wider text-[10px]">Reward Pool</span>
            <span className="text-emerald-400 font-black tracking-tight">{createdDropRef?.amount} {createdDropRef?.token}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <span className="text-zinc-500 font-sans font-bold uppercase tracking-wider text-[10px]">Max Capacity</span>
            <span className="text-zinc-200 font-bold">{createdDropRef?.winnersCount} Slots</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 font-sans font-bold uppercase tracking-wider text-[10px]">Anti-Bot Gate</span>
            <span className="text-zinc-400 font-sans font-semibold">{hasTrivia ? "🧠 Quiz Enabled" : "🔓 Public Access"}</span>
          </div>
        </GlassCard>

        {/* ⚡ INTERACTIVE FUNDING SIMULATION CONTAINER BLOCK */}
        <div className="space-y-3 pt-2">
          <Button 
            disabled={simState === 'connecting' || simState === 'fetching'}
            onClick={async () => {
              triggerHaptic('impact');
              
              setSimState('connecting');
              setSimStatusText('Opening channel to SwiftyEx node...');
              
              setTimeout(async () => {
                setSimState('fetching');
                setSimStatusText('Polling active deposit wallet arrays...');
                
                const walletData = await dropApi.getSwiftyWallets();
                // Safe parsing matching the Postman collection object signature
                const targetAddress = walletData?.[0]?.deposit_address || '0xSwiftyEx_Ledger7b908752352';
                setSimAddress(targetAddress);
                setSimStatusText(`Found active deposit matrix!`);

                setTimeout(() => {
                  setSimState('success');
                  triggerHaptic('success');
                  
                  // Keep bot link launch sequence stable in deep runtime scopes
                  const cleanBotUrl = 'https://t.me/SwiftyEx_bot';
                  if (window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink(cleanBotUrl);
                  else window.open(cleanBotUrl, '_blank');
                }, 1200);

              }, 1000);
            }}
            className="w-full relative overflow-hidden group py-3.5"
          >
            <div className={`absolute inset-0 bg-linear-to-r transition-all duration-500 ${
              simState === 'success' ? 'from-emerald-600 to-green-500' : 'from-brand-accent to-blue-600 group-hover:opacity-90'
            }`} />
            
            <span className="relative z-10 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-white">
              {simState === 'idle' && <>⚡ Fund with SwiftyEx_bot <ExternalLink className="h-3.5 w-3.5" /></>}
              {(simState === 'connecting' || simState === 'fetching') && (
                <span className="flex items-center gap-2 animate-pulse">
                  <div className="w-3 h-3 border-2 border-t-white border-white/20 rounded-full animate-spin" />
                  {simStatusText}
                </span>
              )}
              {simState === 'success' && <>✓  Reward Pool Funded successfully</>}
            </span>
          </Button>

          {simAddress && (
            <div className="p-3 bg-zinc-950/60 border border-white/5 rounded-xl font-mono text-[10px] text-zinc-500 text-center animate-reveal">
              <span className="text-brand-accent font-bold"> Deposit Destination:</span> {simAddress}
            </div>
          )}

          <Button variant="secondary" onClick={() => onNavigate('dashboard')} className="w-full py-3 text-xs font-bold">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2 w-full max-w-md md:max-w-5xl mx-auto px-4 text-left animate-reveal">
      <BackButton onBack={() => onNavigate('dashboard')} fallbackText="Back to Workspace" />
      
      <div className="space-y-0.5">
        <h2 className="text-xl font-black tracking-tight text-white">Create Reward Drop</h2>
        <p className="text-xs text-zinc-500">Send instant rewards. Grow your community.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* Left Side: AI Copilot Section */}
        <div className="md:col-span-4">
          <GlassCard className="border-brand-accent/20 bg-zinc-950/10 space-y-2.5 p-4 rounded-xl h-full">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-accent uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Campaign Prompt Copilot
            </div>
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                placeholder="Reward usdc for answering solana questions..." 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800/80 px-3 py-2 rounded-xl text-xs outline-none text-white placeholder-zinc-600"
              />
              <button 
                type="button"
                onClick={handleAiGeneration}
                disabled={isAiGenerating}
                className="w-full bg-brand-accent text-white rounded-xl py-2 text-xs font-bold hover:bg-blue-600 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {isAiGenerating ? "Processing..." : "Enter"}
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Main Campaign Setup Form */}
        <form onSubmit={handleSubmit} className="md:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Campaign Headline" 
              placeholder="e.g. Welcome Incentive Pool" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
            
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold">Target Community Chat Link</label>
              <input 
                type="url"
                placeholder="e.g., https://t.me/your_community_channel"
                value={communityUrl}
                onChange={(e) => setCommunityUrl(e.target.value)}
                className="w-full bg-zinc-900/20 border border-zinc-800 focus:border-zinc-700 rounded-xl px-4 py-2.5 text-white text-xs outline-none placeholder-zinc-600"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold">Campaign Description</label>
            <textarea 
              rows={3}
              placeholder="Describe action qualification benchmarks explicitly..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900/20 border border-zinc-800 focus:border-zinc-700 rounded-xl px-4 py-2.5 text-white text-xs outline-none resize-none placeholder-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative flex flex-col justify-end">
              <Input 
                label="Pool Capital Size" 
                type="number" 
                placeholder="100.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
                className="pr-24" 
              />
              <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1 bg-zinc-950/80 border border-white/5 p-1 rounded-lg h-8 z-10">
                {['USDT', 'USDC'].map(t => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setToken(t)}
                    className={`text-[9px] font-mono font-black px-2 py-1 rounded transition-all cursor-pointer ${
                      token === t ? 'bg-brand-accent text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Input 
              label="Claim Slots" 
              type="number" 
              placeholder="50" 
              value={winners} 
              onChange={(e) => setWinners(e.target.value)} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            <div onClick={() => { setIsMystery(!isMystery); triggerHaptic('impact'); }} className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${isMystery ? 'bg-amber-500/5 border-amber-500/20 text-white' : 'bg-zinc-900/10 border-zinc-800/60 text-zinc-500'}`}>
              <div className="space-y-0.5 text-left max-w-[85%]">
                <div className="text-xs font-bold text-amber-400">🎰 Mystery Mechanism</div>
                <p className="text-[10px] text-zinc-500 leading-normal">Gamified rewards. Random payouts from a single pool.</p>
              </div>
              <div className="h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 data-box">{isMystery && <Check className="h-3 w-3 stroke-3 text-amber-400" />}</div>
            </div>

            <div onClick={() => { setHasTrivia(!hasTrivia); triggerHaptic('impact'); }} className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${hasTrivia ? 'bg-brand-accent/5 border-brand-accent/20 text-white' : 'bg-zinc-900/10 border-zinc-800/60 text-zinc-500'}`}>
              <div className="space-y-0.5 text-left max-w-[85%]">
                <div className="text-xs font-bold text-brand-accent">🧠 Trivia Verification Gate</div>
                <p className="text-[10px] text-zinc-500 leading-normal">Keep rewards for real humans with trivia verification.</p>
              </div>
              <div className="h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 data-box">{hasTrivia && <Check className="h-3 w-3 stroke-3 text-brand-accent" />}</div>
            </div>
          </div>

          {hasTrivia && (
            <GlassCard className="p-4 space-y-4 border-zinc-800 bg-zinc-950/40 rounded-xl animate-reveal">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Verification Quiz Question</label>
                <input 
                  type="text" 
                  required
                  placeholder="What protocol protects Swifty transactions?"
                  value={triviaQuestion} 
                  onChange={(e) => setTriviaQuestion(e.target.value)}
                  className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 text-xs font-medium text-white outline-none focus:border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Options Grid (Max 4)</label>
                  {triviaOptions.length < 4 && (
                    <button type="button" onClick={addOptionField} className="text-[10px] font-black text-brand-accent flex items-center gap-0.5 hover:underline cursor-pointer">
                      <Plus className="h-3 w-3" /> Add Option
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {triviaOptions.map((option, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-zinc-900/20 border border-white/5 p-2 rounded-xl">
                      <input 
                        type="radio" 
                        name="correctAnswer" 
                        checked={correctIndex === idx} 
                        onChange={() => setCorrectIndex(idx)} 
                        className="w-3.5 h-3.5 accent-brand-accent cursor-pointer shrink-0 ml-1" 
                      />
                      <input 
                        type="text" 
                        required
                        placeholder={`Choice Target #${idx + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 bg-zinc-950/40 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none focus:border-zinc-700"
                      />
                      {triviaOptions.length > 2 && (
                        <button type="button" onClick={() => removeOptionField(idx)} className="p-1.5 text-zinc-600 hover:text-red-400 cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          <div className="pt-2 md:text-right">
            <Button type="submit" className="w-full md:w-auto md:px-10 font-black py-3.5 text-xs uppercase tracking-wider">
              Create Campaign
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}