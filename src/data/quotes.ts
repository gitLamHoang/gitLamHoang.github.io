// Harvey Specter lines from Suits (USA Network). Each one was matched, word for word, in the
// episode transcripts and is spoken by Harvey. Popular lines that are not in the show are excluded.

export interface Quote {
  text: string;
  episode: string;
}

export const quotes = {
  hero: { text: "I don't have dreams. I have goals.", episode: 'S3E6' },
  work: { text: "Winners don't make excuses when the other side plays the game.", episode: 'S1E7' },
  research: { text: "I don't play the odds. I play the man.", episode: 'S2E6' },
  experience: { text: 'Loyalty is a two-way street.', episode: 'S3E1' },
  honors: { text: "I don't get lucky. I make my own luck.", episode: 'S3E15' },
  footer: { text: 'Life is this. I like this.', episode: 'S1E10' },
  notFound: {
    text: "First impressions last. If you start behind the eight ball, you'll never get in front.",
    episode: 'S1E3',
  },
} satisfies Record<string, Quote>;

export type QuoteKey = keyof typeof quotes;
