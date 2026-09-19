export type RadioMonth = {
  radio: string;
  jun: number;
  jul: number;
  ago: number;
};

export type RankedRadio = RadioMonth & {
  media: number;
  change: number;
};

export function calculateRanking(
  radios: RadioMonth[],
  selectedRadio: string,
  september: number
): RankedRadio[] {
  return radios
    .map((radio) => {
      const septemberValue = radio.radio === selectedRadio ? september : radio.ago;
      const media = (radio.jul + radio.ago + septemberValue) / 3;
      const currentMedia = (radio.jun + radio.jul + radio.ago) / 3;

      return {
        ...radio,
        media,
        change: media - currentMedia
      };
    })
    .sort((a, b) => b.media - a.media);
}
