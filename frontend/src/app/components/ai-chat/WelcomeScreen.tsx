import React from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, Landmark } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import type { SuggestedPrompt } from './types';
import { SUGGESTED_PROMPTS } from './types';

const categoryColors: Record<string, string> = {
  schemes: 'from-green-500 to-emerald-600',
  career: 'from-blue-500 to-indigo-600',
  coding: 'from-purple-500 to-violet-600',
  study: 'from-orange-500 to-amber-600',
  health: 'from-pink-500 to-rose-600',
};

const categoryBg: Record<string, string> = {
  schemes: 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300',
  career: 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300',
  coding: 'bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300',
  study: 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
  health: 'bg-pink-50 border-pink-200 hover:bg-pink-100 hover:border-pink-300',
};

interface WelcomeScreenProps {
  onSelectPrompt: (query: string) => void;
  userName?: string;
  language?: string;
}

const localizedWelcome: Record<string, {
  greeting: (n?: string) => string;
  subtitle: string;
  promptsLabel: string;
  portalSubtitle: string;
  trustLine: string;
  prompts: SuggestedPrompt[];
}> = {
  hi: {
    greeting: (n) => `नमस्ते${n ? `, ${n}` : ''}!`,
    subtitle: 'आज मैं आपकी कैसे मदद कर सकता हूं?',
    promptsLabel: 'त्वरित प्रश्न और सुझाव',
    portalSubtitle: 'राष्ट्रीय AI सेवा पोर्टल · Gemini द्वारा संचालित',
    trustLine: 'सारथी सत्यापित सरकारी डेटा का उपयोग करता है। कार्रवाई करने से पहले हमेशा आधिकारिक पोर्टल से जांच करें।',
    prompts: [
      { text: 'मेरे लिए छात्रवृत्ति खोजें', query: 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) पर छात्रों के लिए कौन सी छात्रवृत्तियां उपलब्ध हैं?', category: 'schemes', icon: '🎓' },
      { text: 'करियर मार्ग का सुझाव दें', query: 'इंजीनियरिंग पृष्ठभूमि के आधार पर, सबसे अच्छे करियर विकल्प और रोडमैप सुझाएं', category: 'career', icon: '🚀' },
      { text: 'React Hooks समझाएं', query: 'React Hooks को व्यावहारिक उदाहरणों के साथ समझाएं — useState, useEffect, useCallback', category: 'coding', icon: '⚛️' },
      { text: 'PM-KISAN पात्रता जांचें', query: 'PM-KISAN योजना के लिए पात्रता मानदंड क्या हैं और आवेदन कैसे करें?', category: 'schemes', icon: '🌾' },
      { text: 'मेरा रिज्यूमे बनाएं', query: 'सॉफ्टवेयर डेवलपर भूमिका के लिए एक मजबूत रिज्यूमे बनाने में मेरी मदद करें', category: 'career', icon: '📄' },
      { text: 'इंटरव्यू के प्रश्न तैयार करें', query: 'फुल-स्टैक डेवलपर के लिए उत्तरों के साथ शीर्ष 20 साक्षात्कार प्रश्न दें', category: 'career', icon: '💼' },
      { text: 'सरकारी योजनाओं की तुलना करें', query: 'PM-KISAN, आयुष्मान भारत और PMAY की तुलना करें — पात्रता और लाभ', category: 'schemes', icon: '⚖️' },
      { text: 'परीक्षा के लिए अध्ययन योजना', query: 'प्रतियोगी परीक्षा की तैयारी के लिए 30 दिनों की स्मार्ट अध्ययन योजना बनाएं', category: 'study', icon: '📚' },
    ]
  },
  bn: {
    greeting: (n) => `নমস্কার${n ? `, ${n}` : ''}!`,
    subtitle: 'আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
    promptsLabel: 'দ্রুত প্রশ্ন ও পরামর্শ',
    portalSubtitle: 'জাতীয় AI সেবা পোর্টাল · Gemini দ্বারা চালিত',
    trustLine: 'সারথী যাচাইকৃত সরকারি তথ্য ব্যবহার করে। কোনো পদক্ষেপ নেওয়ার আগে সর্বদা সরকারি পোর্টাল যাচাই করুন।',
    prompts: [
      { text: 'আমার জন্য বৃত্তি খুঁজুন', query: 'জাতীয় বৃত্তি পোর্টালে (NSP) শিক্ষার্থীদের জন্য কী কী বৃত্তি উপলব্ধ আছে?', category: 'schemes', icon: '🎓' },
      { text: 'ক্যারিয়ার পাথ পরামর্শ দিন', query: 'ইঞ্জিনিয়ারিং ব্যাকগ্রাউন্ডের উপর ভিত্তি করে সেরা ক্যারিয়ার পাথ এবং রোডম্যাপ সাজেস্ট করুন', category: 'career', icon: '🚀' },
      { text: 'React Hooks ব্যাখ্যা করুন', query: 'বাস্তব উদাহরণের সাথে React Hooks ব্যাখ্যা করুন — useState, useEffect, useCallback', category: 'coding', icon: '⚛️' },
      { text: 'PM-KISAN যোগ্যতা যাচাই করুন', query: 'PM-KISAN প্রকল্পের যোগ্যতার মানদণ্ড কী এবং কীভাবে আবেদন করবেন?', category: 'schemes', icon: '🌾' },
      { text: 'আমার জীবনবৃত্তান্ত তৈরি করুন', query: 'সফটওয়্যার ইঞ্জিনিয়ারিং পদের জন্য একটি শক্তিশালী জীবনবৃত্তান্ত তৈরি করতে সাহায্য করুন', category: 'career', icon: '📄' },
      { text: 'ইন্টারভিউ প্রশ্ন প্রস্তুত করুন', query: 'উত্তর সহ ফুল-স্ট্যাক ডেভেলপার পদের জন্য সেরা ২০টি ইন্টারভিউ প্রশ্ন দিন', category: 'career', icon: '💼' },
      { text: 'সরকারি প্রকল্পের তুলনা করুন', query: 'PM-KISAN, আয়ুষ্মান ভারত এবং PMAY-এর তুলনা করুন — যোগ্যতা ও সুবিধা', category: 'schemes', icon: '⚖️' },
      { text: 'পরীক্ষার জন্য স্টাডি রোডম্যাপ', query: 'প্রতিযোগিতামূলক পরীক্ষার প্রস্তুতির জন্য ৩০ দিনের স্মার্ট স্টাডি প্ল্যান তৈরি করুন', category: 'study', icon: '📚' },
    ]
  },
  ta: {
    greeting: (n) => `வணக்கம்${n ? `, ${n}` : ''}!`,
    subtitle: 'இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    promptsLabel: 'விரைவான கேள்விகள் & ஆலோசனைகள்',
    portalSubtitle: 'தேசிய AI சேவை போர்ட்டல் · Gemini மூலம் இயக்கப்படுகிறது',
    trustLine: 'சாரதி சரிபார்க்கப்பட்ட அரசுத் தரவைப் பயன்படுத்துகிறது. முக்கிய நடவடிக்கைகளுக்கு முன் அதிகாரப்பூர்வ தளங்களைச் சரிபார்க்கவும்.',
    prompts: [
      { text: 'எனக்கான உதவித்தொகை தேடு', query: 'தேசிய உதவித்தொகை போர்ட்டலில் (NSP) மாணவர்களுக்கு என்னென்ன உதவித்தொகைகள் உள்ளன?', category: 'schemes', icon: '🎓' },
      { text: 'தொழில் வழிகாட்டுதல் கூறு', query: 'பொறியியல் பின்னணியின் அடிப்படையில் சிறந்த தொழில் வழிகள் மற்றும் வரைபடத்தை பரிந்துரைக்கவும்', category: 'career', icon: '🚀' },
      { text: 'React Hooks விளக்கு', query: 'நடைமுறை எடுத்துக்காட்டுகளுடன் React Hooks-ஐ விளக்குக — useState, useEffect', category: 'coding', icon: '⚛️' },
      { text: 'PM-KISAN தகுதி சரிபார்', query: 'PM-KISAN திட்டத்திற்கான தகுதி வரம்புகள் என்ன மற்றும் எப்படி விண்ணப்பிப்பது?', category: 'schemes', icon: '🌾' },
      { text: 'என் ரெஸ்யூம் உருவாக்கு', query: 'மென்பொருள் மேம்பாட்டாளர் பதவிக்கு வலுவான ரெஸ்யூம் உருவாக்க உதவுங்கள்', category: 'career', icon: '📄' },
      { text: 'நேர்காணல் கேள்விகள் தயார் செய்', query: 'புல்-ஸ்டாக் டெவலப்பருக்கான விடைகளுடன் கூடிய முதல் 20 நேர்காணல் கேள்விகளைத் தரவும்', category: 'career', icon: '💼' },
      { text: 'அரசு திட்டங்களை ஒப்பிடு', query: 'PM-KISAN, ஆயுஷ்மான் பாரத் மற்றும் PMAY ஆகியவற்றை ஒப்பிடுக — தகுதி மற்றும் நன்மைகள்', category: 'schemes', icon: '⚖️' },
      { text: 'தேர்வுக்கான படிப்பு திட்டம்', query: 'போட்டித் தேர்வு தயாரிப்பிற்கான 30 நாள் ஸ்மார்ட் படிப்பு திட்டத்தை உருவாக்கவும்', category: 'study', icon: '📚' },
    ]
  },
  te: {
    greeting: (n) => `నమస్కారం${n ? `, ${n}` : ''}!`,
    subtitle: 'ఈరోజు నేను మీకు ఎలా సహాయపడగలను?',
    promptsLabel: 'త్వరిత సూచనలు & ప్రశ్నలు',
    portalSubtitle: 'జాతీయ AI సేవా పోర్టల్ · Gemini ఆధారితం',
    trustLine: 'సారథి ధృవీకరించబడిన ప్రభుత్వ సమాచారాన్ని ఉపయోగిస్తుంది. చర్య తీసుకునే ముందు అధికారిక పోర్టల్స్‌ను పరిశీలించండి.',
    prompts: [
      { text: 'నా కోసం స్కాలర్‌షిప్‌లను కనుగొనండి', query: 'జాతీయ స్కాలర్‌షిప్ పోర్టల్‌లో (NSP) విద్యార్థులకు ఏ స్కాలర్‌షిప్‌లు అందుబాటులో ఉన్నాయి?', category: 'schemes', icon: '🎓' },
      { text: 'కెరీర్ మార్గాన్ని సూచించండి', query: 'ఇంజనీరింగ్ నేపథ్యం ఆధారంగా, ఉత్తమ కెరీర్ మార్గాలు మరియు రోడ్‌మ్యాప్‌ను సూచించండి', category: 'career', icon: '🚀' },
      { text: 'React Hooks వివరించండి', query: 'ఆచరణాత్మక ఉదాహరణలతో React Hooks వివరించండి — useState, useEffect, useCallback', category: 'coding', icon: '⚛️' },
      { text: 'PM-KISAN అర్హతను తనిఖీ చేయండి', query: 'PM-KISAN పథకం కోసం అర్హతా ప్రమాణాలు ఏమిటి మరియు ఎలా దరఖాస్తు చేయాలి?', category: 'schemes', icon: '🌾' },
      { text: 'నా రెజ్యూమెను రూపొందించండి', query: 'సాఫ్ట్‌వేర్ ఇంజనీర్ పాత్ర కోసం బలమైన రెజ్యూమెను రూపొందించడంలో నాకు సహాయపడండి', category: 'career', icon: '📄' },
      { text: 'ఇంటర్వ్యూ ప్రశ్నలను సిద్ధం చేయండి', query: 'సమాధానాలతో ఫుల్-స్టాక్ డెవలపర్ పాత్ర కోసం టాప్ 20 ఇంటర్వ్యూ ప్రశ్నలను ఇవ్వండి', category: 'career', icon: '💼' },
      { text: 'ప్రభుత్వ పథకాలను పోల్చండి', query: 'PM-KISAN, ఆయుష్మాన్ భారత్ మరియు PMAY లను పోల్చండి — అర్హత మరియు ప్రయోజనాలు', category: 'schemes', icon: '⚖️' },
      { text: 'పరీక్షల కోసం స్టడీ రోడ్‌మ్యాప్', query: 'పోటీ పరీక్షల తయారీ కోసం 30 రోజుల స్మార్ట్ స్టడీ ప్లాన్ మరియు రోడ్‌మ్యాప్‌ను సృష్టించండి', category: 'study', icon: '📚' },
    ]
  },
  mr: {
    greeting: (n) => `नमस्कार${n ? `, ${n}` : ''}!`,
    subtitle: 'आज मी तुम्हाला कशी मदत करू शकतो?',
    promptsLabel: 'जलद प्रश्न आणि सूचना',
    portalSubtitle: 'राष्ट्रीय AI सेवा पोर्टल · Gemini द्वारे संचालित',
    trustLine: 'सारथी सत्यापित सरकारी डेटा वापरते. कोणतीही कृती करण्यापूर्वी नेहमी अधिकृत पोर्टल तपासा.',
    prompts: [
      { text: 'माझ्यासाठी शिष्यवृत्ती शोधा', query: 'राष्ट्रीय शिष्यवृत्ती पोर्टलवर (NSP) विद्यार्थ्यांसाठी कोणत्या शिष्यवृत्त्या उपलब्ध आहेत?', category: 'schemes', icon: '🎓' },
      { text: 'करिअर मार्ग सुचवा', query: 'इंजिनिअरिंग पार्श्वभूमीवर आधारित, सर्वोत्तम करिअर पर्याय आणि रोडमॅप सांगा', category: 'career', icon: '🚀' },
      { text: 'React Hooks स्पष्ट करा', query: 'व्यावहारिक उदाहरणांसह React Hooks स्पष्ट करा — useState, useEffect, useCallback', category: 'coding', icon: '⚛️' },
      { text: 'PM-KISAN पात्रता तपासा', query: 'PM-KISAN योजनेसाठी पात्रता निकष काय आहेत आणि अर्ज कसा करावा?', category: 'schemes', icon: '🌾' },
      { text: 'माझा रेझ्युमे तयार करा', query: 'सॉफ्टवेअर इंजिनिअर पदासाठी भक्कम रेझ्युमे तयार करण्यात मला मदत करा', category: 'career', icon: '📄' },
      { text: 'इंटरव्ह्यू प्रश्न तयार करा', query: 'उत्तरांसह फुल-स्टॅक डेव्हलपर पदासाठी शीर्ष 20 मुलाखत प्रश्न द्या', category: 'career', icon: '💼' },
      { text: 'सरकारी योजनांची तुलना करा', query: 'PM-KISAN, आयुष्मान भारत आणि PMAY ची तुलना करा — पात्रता आणि फायदे', category: 'schemes', icon: '⚖️' },
      { text: 'परीक्षेसाठी अभ्यास योजना', query: 'स्पर्धा परीक्षेच्या तयारीसाठी 30 दिवसांची स्मार्ट अभ्यास योजना तयार करा', category: 'study', icon: '📚' },
    ]
  },
  gu: {
    greeting: (n) => `નમસ્તે${n ? `, ${n}` : ''}!`,
    subtitle: 'આજે હું તમને કેવી રીતે મદદ કરી શકું?',
    promptsLabel: 'ઝડપી પ્રશ્નો અને સૂચનો',
    portalSubtitle: 'રાષ્ટ્રીય AI સેવા પોર્ટલ · Gemini દ્વારા સંચાલિત',
    trustLine: 'સારથી ચકાસાયેલ સરકારી ડેટાનો ઉપયોગ કરે છે. પગલાં લેતા પહેલા હંમેશા સત્તાવાર પોર્ટલ ચકાસો.',
    prompts: [
      { text: 'મારા માટે શિષ્યવૃત્તિ શોધો', query: 'નેશનલ સ્કોલરશિપ પોર્ટલ (NSP) પર વિદ્યાર્થીઓ માટે કઈ શિષ્યવૃત્તિ ઉપલબ્ધ છે?', category: 'schemes', icon: '🎓' },
      { text: 'કારકિર્દી માર્ગ સૂચવો', query: 'એન્જિનિયરિંગ પૃષ્ઠભૂમિના આધારે, શ્રેષ્ઠ કારકિર્દી વિકલ્પો અને રોડમેપ સૂચવો', category: 'career', icon: '🚀' },
      { text: 'React Hooks સમજાવો', query: 'વ્યવહારુ ઉદાહરણો સાથે React Hooks સમજાવો — useState, useEffect, useCallback', category: 'coding', icon: '⚛️' },
      { text: 'PM-KISAN પાત્રતા તપાસો', query: 'PM-KISAN યોજના માટે પાત્રતા માપદંડ શું છે અને કેવી રીતે અરજી કરવી?', category: 'schemes', icon: '🌾' },
      { text: 'મારો રિઝ્યુમે બનાવો', query: 'સૉફ્ટવેર એન્જિનિયર ભૂમિકા માટે મજબૂત રિઝ્યુમે બનાવવામાં મને મદદ કરો', category: 'career', icon: '📄' },
      { text: 'ઇન્ટરવ્યુ પ્રશ્નો તૈયાર કરો', query: 'જવાબો સાથે ફુલ-સ્ટેક ડેવલપર માટે ટોચના 20 ઇન્ટરવ્યુ પ્રશ્નો આપો', category: 'career', icon: '💼' },
      { text: 'સરકારી યોજનાઓની સરખામણી કરો', query: 'PM-KISAN, આયુષ્માન ભારત અને PMAY ની સરખામણી કરો — પાત્રતા અને લાભો', category: 'schemes', icon: '⚖️' },
      { text: 'પરીક્ષા માટે અભ્યાસ યોજના', query: 'સ્પર્ધાત્મક પરીક્ષાની તૈયારી માટે 30 દિવસની સ્માર્ટ અભ્યાસ યોજના બનાવો', category: 'study', icon: '📚' },
    ]
  },
  kn: {
    greeting: (n) => `ನಮಸ್ಕಾರ${n ? `, ${n}` : ''}!`,
    subtitle: 'ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    promptsLabel: 'ತ್ವರಿತ ಸಲಹೆಗಳು & ಪ್ರಶ್ನೆಗಳು',
    portalSubtitle: 'ರಾಷ್ಟ್ರೀಯ AI ಸೇವಾ ಪೋರ್ಟಲ್ · Gemini ಚಾಲಿತ',
    trustLine: 'ಸಾರಥಿ ಪರಿಶೀಲಿಸಿದ ಸರ್ಕಾರಿ ಡೇಟಾವನ್ನು ಬಳಸುತ್ತದೆ. ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳುವ ಮೊದಲು ಯಾವಾಗಲೂ ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
    prompts: [
      { text: 'ನನಗಾಗಿ ವಿದ್ಯಾರ್ಥಿವೇತನ ಹುಡುಕಿ', query: 'ರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ (NSP) ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಯಾವ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು ಲಭ್ಯವಿವೆ?', category: 'schemes', icon: '🎓' },
      { text: 'ವೃತ್ತಿ ಮಾರ್ಗವನ್ನು ಸೂಚಿಸಿ', query: 'ಇಂಜಿನಿಯರಿಂಗ್ ಹಿನ್ನೆಲೆ ಆಧಾರದ ಮೇಲೆ, ಅತ್ಯುತ್ತಮ ವೃತ್ತಿ ಮಾರ್ಗಗಳು ಮತ್ತು ರೋಡ್‌ಮ್ಯಾಪ್ ಸೂಚಿಸಿ', category: 'career', icon: '🚀' },
      { text: 'React Hooks ವಿವರಿಸಿ', query: 'ಪ್ರಾಯೋಗಿಕ ಉದಾಹರಣೆಗಳೊಂದಿಗೆ React Hooks ವಿವರಿಸಿ — useState, useEffect, useCallback', category: 'coding', icon: '⚛️' },
      { text: 'PM-KISAN ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ', query: 'PM-KISAN ಯೋಜನೆಗೆ ಅರ್ಹತಾ ಮಾನದಂಡಗಳೇನು ಮತ್ತು ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕು?', category: 'schemes', icon: '🌾' },
      { text: 'ನನ್ನ ರೆಸ್ಯೂಮ್ ರಚಿಸಿ', query: 'ಸಾಫ್ಟ್‌ವೇರ್ ಇಂಜಿನಿಯರ್ ಹುದ್ದೆಗೆ ಬಲವಾದ ರೆಸ್ಯೂಮ್ ನಿರ್ಮಿಸಲು ನನಗೆ ಸಹಾಯ ಮಾಡಿ', category: 'career', icon: '📄' },
      { text: 'ಸಂದರ್ಶನ ಪ್ರಶ್ನೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ', query: 'ಉತ್ತರಗಳೊಂದಿಗೆ ಫುಲ್-ಸ್ಟಾಕ್ ಡೆವಲಪರ್ ಹುದ್ದೆಗೆ ಟಾಪ್ 20 ಸಂದರ್ಶನ ಪ್ರಶ್ನೆಗಳನ್ನು ನೀಡಿ', category: 'career', icon: '💼' },
      { text: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹೋಲಿಸಿ', query: 'PM-KISAN, ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಮತ್ತು PMAY ಹೋಲಿಸಿ — ಅರ್ಹತೆ ಮತ್ತು ಪ್ರಯೋಜನಗಳು', category: 'schemes', icon: '⚖️' },
      { text: 'ಪರೀಕ್ಷೆಗಳಿಗೆ ಅಧ್ಯಯನ ಯೋಜನೆ', query: 'ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಯ ತಯಾರಿಗಾಗಿ 30 ದಿನಗಳ ಸ್ಮಾರ್ಟ್ ಅಧ್ಯಯನ ಯೋಜನೆಯನ್ನು ರಚಿಸಿ', category: 'study', icon: '📚' },
    ]
  },
  en: {
    greeting: (n) => `Hello${n ? `, ${n}` : ''}!`,
    subtitle: 'How can I help you today?',
    promptsLabel: 'Quick suggestions & topics',
    portalSubtitle: 'National AI Service Portal · Powered by Gemini',
    trustLine: 'Sarthi uses verified government data. Always verify critical information with official portals before taking action.',
    prompts: SUGGESTED_PROMPTS
  }
};

export function WelcomeScreen({ onSelectPrompt, userName, language: propLanguage }: WelcomeScreenProps) {
  const navigate = useNavigate();
  const { language: contextLanguage } = useLanguage();
  const activeLang = propLanguage || contextLanguage || 'en';
  const content = localizedWelcome[activeLang] || localizedWelcome.en;

  const greeting = content.greeting(userName);
  const subtitle = content.subtitle;
  const promptsLabel = content.promptsLabel;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 select-none">
      {/* Logo + Branding */}
      <div 
        onClick={() => navigate('/')} 
        className="flex flex-col items-center mb-8 cursor-pointer hover:opacity-85 transition-opacity"
      >
        {/* Animated Logo Ring */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0F2B5B] to-[#1D4ED8] flex items-center justify-center shadow-2xl">
            <Landmark className="w-9 h-9 text-white" />
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1D4ED8] to-purple-600 animate-ping opacity-20" />
          {/* Sparkle badge */}
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-white">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F2B5B] tracking-tight">
              SARTHI
            </h1>
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-[#F97316] text-white">
              GOV
            </span>
          </div>
          <p className="text-xs text-gray-500 font-semibold tracking-widest uppercase">
            {content.portalSubtitle}
          </p>
        </div>
      </div>

      {/* Greeting */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">{greeting}</h2>
        <p className="text-lg text-gray-500 font-medium">{subtitle}</p>
      </div>

      {/* Suggested Prompts Grid */}
      <div className="w-full max-w-2xl">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-4">
          {promptsLabel}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.prompts.map((prompt, idx) => (
            <PromptCard
              key={idx}
              prompt={prompt}
              onClick={() => onSelectPrompt(prompt.query)}
            />
          ))}
        </div>
      </div>

      {/* Trust line */}
      <p className="mt-8 text-xs text-gray-400 text-center max-w-md">
        {content.trustLine}
      </p>
    </div>
  );
}

function PromptCard({ prompt, onClick }: { prompt: SuggestedPrompt; onClick: () => void }) {
  const bg = categoryBg[prompt.category] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 w-full text-left px-4 py-3.5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 ${bg}`}
    >
      {/* Icon */}
      <span className="text-xl flex-shrink-0 mt-0.5">{prompt.icon}</span>
      {/* Text */}
      <div>
        <p className="text-sm font-bold text-gray-800">{prompt.text}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-1">{prompt.query.slice(0, 60)}…</p>
      </div>
    </button>
  );
}
