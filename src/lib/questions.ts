// Sample theory questions for the PoC. Rules vary by country; these are generic examples.

export type Question = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export const PASS_THRESHOLD = 0.8;

export const QUESTIONS: Question[] = [
  {
    question: "How many people may ride a rental e-scooter at the same time?",
    options: ["One", "Two, if both are adults", "Two, if one is a child", "As many as fit"],
    answer: 0,
    explanation: "E-scooters are designed and approved for exactly one rider.",
  },
  {
    question: "There is a bike lane next to the road. Where do you ride?",
    options: ["On the sidewalk", "In the bike lane", "In the middle of the car lane", "Wherever is fastest"],
    answer: 1,
    explanation: "Where a bike lane exists, e-scooters generally have to use it.",
  },
  {
    question: "Are you allowed to ride on the sidewalk?",
    options: [
      "Yes, always",
      "Yes, if you ride slowly",
      "Generally no, unless a sign explicitly allows it",
      "Only at night",
    ],
    answer: 2,
    explanation: "Sidewalks belong to pedestrians. Ride there only where signs explicitly permit it.",
  },
  {
    question: "You had several drinks at a party. How do you get home?",
    options: [
      "By e-scooter, but slowly",
      "By e-scooter on the sidewalk to stay safe",
      "Walk, take public transport or a taxi",
      "By e-scooter, with a friend steering",
    ],
    answer: 2,
    explanation: "Alcohol limits apply to e-scooters just like other vehicles. Don't ride impaired.",
  },
  {
    question: "What should you check before starting a ride?",
    options: ["Only the battery level", "Brakes, lights and tires", "Nothing, the provider checks it", "The color of the scooter"],
    answer: 1,
    explanation: "A quick check of brakes, lights and tires helps you spot a damaged scooter before you ride.",
  },
  {
    question: "Where should you park the e-scooter after your ride?",
    options: [
      "In the middle of the sidewalk",
      "In front of a building entrance",
      "In a designated area or where it doesn't block anyone",
      "On tactile paving for the visually impaired",
    ],
    answer: 2,
    explanation: "Badly parked scooters are a hazard, especially for people with disabilities.",
  },
  {
    question: "How do you indicate that you are turning left?",
    options: ["Not at all", "By honking", "By signaling with your arm in good time", "By slowing down suddenly"],
    answer: 2,
    explanation: "Signal your turn early by hand so others can anticipate your move.",
  },
  {
    question: "May you use your phone while riding?",
    options: ["Yes, for navigation in your hand", "Yes, for short calls", "No, keep both hands on the handlebar", "Only at red lights while moving"],
    answer: 2,
    explanation: "Holding a phone while riding is distracting and dangerous.",
  },
  {
    question: "It is raining and the road is wet. What changes?",
    options: [
      "Nothing",
      "Braking distance gets longer, so ride slower and brake gently",
      "You can ride faster because there is less traffic",
      "You should ride on the sidewalk",
    ],
    answer: 1,
    explanation: "Small wheels have little grip on wet surfaces. Slow down and brake early.",
  },
  {
    question: "It is getting dark. What do you do?",
    options: [
      "Turn on the lights and stay visible",
      "Ride closer to cars so they see you",
      "Nothing, street lights are enough",
      "Ride faster to get home before dark",
    ],
    answer: 0,
    explanation: "Lights make sure others can see you.",
  },
];
