import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { quizId, guests } = await request.json();

    if (!guests || !Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json(
        { error: 'Ingen gästinformation tillgänglig' },
        { status: 400 }
      );
    }

    const prompt = `
Du är en musikquiz-generator. Du ska skapa ett engagerande musikquiz med 10 frågor anpassade efter gästernas musiksmak och ålder. Här är information om gästerna:

${JSON.stringify(guests)}

För varje fråga ska du:

1. Välja en låt som passar gruppen baserat på gästernas musiksmak och födelseår. Låten ska vara lagom känd, utmanande och underhållande.

2. Ange det korrekta svaret för:
- Låttitel
- Artist eller grupp
- År då låten släpptes

3. Skapa 4 felaktiga men trovärdiga alternativ för Artist/Grupp.
4. Skapa 4 felaktiga men trovärdiga alternativ för Låttitel. Använd gärna humoristiska, kreativa variationer av originaltiteln som känns trovärdiga.
5. Skapa en intressant triviafråga relaterad till låten, artisten eller året. 
   VIKTIGT: Triviafrågan får INTE avslöja rätt svar för Artist, Låttitel eller År. 
   Triviafrågan ska ha ett korrekt svar och 4 felaktiga men plausibla alternativ.

Returnera ENDAST giltig JSON enligt nedanstående struktur:

{
  "quizTitle": "Exempelquiz",
  "questions": [
    {
      "correctAnswers": {
        "title": "Låtens titel",
        "artist": "Artistens namn",
        "year": "Utgivningsår"
      },
      "artistOptions": ["Rätt artist", "Fel artist 1", "Fel artist 2", "Fel artist 3", "Fel artist 4"],
      "titleOptions": ["Rätt titel", "Fel titel 1", "Fel titel 2", "Fel titel 3", "Fel titel 4"],
      "trivia": {
        "question": "En relaterad triviafråga som INTE avslöjar rätt svar på artist, titel eller år",
        "correctAnswer": "Korrekt trivia-svar",
        "options": ["Korrekt trivia-svar", "Fel trivia-svar 1", "Fel trivia-svar 2", "Fel trivia-svar 3", "Fel trivia-svar 4"]
      }
    }
    // Lägg till totalt 10 frågor med ovanstående struktur
  ]
}
`;

    // Anropa OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Du är en musikquiz-generator som skapar frågor i JSON-format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      return NextResponse.json(
        { error: 'Inget svar från OpenAI' },
        { status: 500 }
      );
    }

    // Försök parsa JSON-resultatet
    try {
      const quizData = JSON.parse(responseContent);
      return NextResponse.json({ quiz: quizData, quizId });
    } catch (e) {
      console.error('Kunde inte parsa JSON-svar från OpenAI:', e);
      return NextResponse.json(
        { error: 'Felaktigt format på svar från OpenAI' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Fel vid generering av quiz:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid generering av quiz' },
      { status: 500 }
    );
  }
}