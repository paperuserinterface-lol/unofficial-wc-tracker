// Players database for Draft Mode - only players from 2026 WC qualified teams
const PLAYERS = [
    // Argentina
    { id: 1, name: 'Lionel Messi', position: 'RW', nation: '🇦🇷', club: 'Inter Miami', rating: 94, pace: 80, shooting: 94, passing: 92, dribbling: 96, defense: 38, physical: 68 },
    { id: 2, name: 'Emiliano Martínez', position: 'GK', nation: '🇦🇷', club: 'Aston Villa', rating: 88, pace: 55, shooting: 20, passing: 70, dribbling: 60, defense: 30, physical: 80, diving: 90, handling: 88, kicking: 75, positioning: 92, reflexes: 89 },
    { id: 3, name: 'Rodrigo De Paul', position: 'CM', nation: '🇦🇷', club: 'Atlético Madrid', rating: 84, pace: 78, shooting: 75, passing: 82, dribbling: 85, defense: 70, physical: 80 },
    { id: 4, name: 'Nahuel Molina', position: 'RB', nation: '🇦🇷', club: 'Atlético Madrid', rating: 83, pace: 85, shooting: 65, passing: 78, dribbling: 80, defense: 75, physical: 75 },

    // Brazil
    { id: 5, name: 'Neymar Jr.', position: 'LW', nation: '🇧🇷', club: 'Al-Hilal', rating: 91, pace: 88, shooting: 86, passing: 88, dribbling: 96, defense: 40, physical: 68 },
    { id: 6, name: 'Vinícius Jr.', position: 'LW', nation: '🇧🇷', club: 'Real Madrid', rating: 92, pace: 95, shooting: 86, passing: 82, dribbling: 93, defense: 35, physical: 72 },
    { id: 7, name: 'Richarlison', position: 'ST', nation: '🇧🇷', club: 'Tottenham', rating: 85, pace: 89, shooting: 84, passing: 68, dribbling: 82, defense: 45, physical: 82 },
    { id: 8, name: 'Casemiro', position: 'CDM', nation: '🇧🇷', club: 'Manchester United', rating: 86, pace: 68, shooting: 70, passing: 78, dribbling: 75, defense: 88, physical: 90 },
    { id: 9, name: 'Ederson', position: 'GK', nation: '🇧🇷', club: 'Manchester City', rating: 90, pace: 60, shooting: 28, passing: 94, dribbling: 72, defense: 32, physical: 78, diving: 88, handling: 88, kicking: 98, positioning: 88, reflexes: 86 },

    // England
    { id: 10, name: 'Jude Bellingham', position: 'CM', nation: '🏴', club: 'Real Madrid', rating: 92, pace: 82, shooting: 88, passing: 90, dribbling: 91, defense: 78, physical: 86 },
    { id: 11, name: 'Harry Kane', position: 'ST', nation: '🏴', club: 'Bayern Munich', rating: 92, pace: 78, shooting: 94, passing: 88, dribbling: 86, defense: 48, physical: 85 },
    { id: 12, name: 'Marcus Rashford', position: 'LW', nation: '🏴', club: 'Manchester United', rating: 86, pace: 94, shooting: 83, passing: 78, dribbling: 88, defense: 44, physical: 78 },
    { id: 13, name: 'Trent Alexander-Arnold', position: 'RB', nation: '🏴', club: 'Liverpool', rating: 89, pace: 80, shooting: 78, passing: 94, dribbling: 84, defense: 78, physical: 76 },
    { id: 14, name: 'Phil Foden', position: 'RW', nation: '🏴', club: 'Manchester City', rating: 91, pace: 89, shooting: 85, passing: 87, dribbling: 92, defense: 50, physical: 70 },
    { id: 15, name: 'Bukayo Saka', position: 'RW', nation: '🏴', club: 'Arsenal', rating: 90, pace: 93, shooting: 83, passing: 84, dribbling: 89, defense: 44, physical: 72 },
    { id: 16, name: 'Declan Rice', position: 'CDM', nation: '🏴', club: 'Arsenal', rating: 89, pace: 78, shooting: 72, passing: 85, dribbling: 84, defense: 83, physical: 86 },
    { id: 17, name: 'Cole Palmer', position: 'CAM', nation: '🏴', club: 'Chelsea', rating: 87, pace: 85, shooting: 84, passing: 82, dribbling: 90, defense: 48, physical: 72 },

    // France
    { id: 18, name: 'Kylian Mbappé', position: 'ST', nation: '🇫🇷', club: 'Real Madrid', rating: 96, pace: 99, shooting: 92, passing: 84, dribbling: 93, defense: 40, physical: 80 },
    { id: 19, name: 'Ousmane Dembélé', position: 'RW', nation: '🇫🇷', club: 'Paris Saint-Germain', rating: 87, pace: 97, shooting: 79, passing: 82, dribbling: 93, defense: 40, physical: 72 },
    { id: 20, name: 'Randal Kolo Muani', position: 'ST', nation: '🇫🇷', club: 'Paris Saint-Germain', rating: 87, pace: 93, shooting: 84, passing: 78, dribbling: 84, defense: 44, physical: 86 },
    { id: 21, name: 'Mike Maignan', position: 'GK', nation: '🇫🇷', club: 'AC Milan', rating: 89, pace: 55, shooting: 20, passing: 75, dribbling: 60, defense: 25, physical: 85, diving: 91, handling: 88, kicking: 78, positioning: 90, reflexes: 92 },
    { id: 22, name: 'William Saliba', position: 'CB', nation: '🇫🇷', club: 'Arsenal', rating: 88, pace: 83, shooting: 53, passing: 76, dribbling: 73, defense: 91, physical: 83 },
    { id: 23, name: 'Dayot Upamecano', position: 'CB', nation: '🇫🇷', club: 'Bayern Munich', rating: 86, pace: 82, shooting: 52, passing: 72, dribbling: 70, defense: 88, physical: 88 },
    { id: 24, name: 'Jules Koundé', position: 'CB', nation: '🇫🇷', club: 'Barcelona', rating: 87, pace: 86, shooting: 64, passing: 80, dribbling: 80, defense: 85, physical: 80 },
    { id: 83, name: 'Michael Olise', position: 'CAM', nation: '🇫🇷', club: 'Bayern Munich', rating: 85, pace: 82, shooting: 80, passing: 84, dribbling: 88, defense: 45, physical: 65 },

    // Spain
    { id: 25, name: 'Rodri', position: 'CDM', nation: '🇪🇸', club: 'Manchester City', rating: 92, pace: 68, shooting: 72, passing: 92, dribbling: 84, defense: 91, physical: 85 },
    { id: 26, name: 'Pedri', position: 'CM', nation: '🇪🇸', club: 'Barcelona', rating: 91, pace: 78, shooting: 78, passing: 90, dribbling: 93, defense: 68, physical: 70 },
    { id: 27, name: 'Gavi', position: 'CM', nation: '🇪🇸', club: 'Barcelona', rating: 89, pace: 82, shooting: 76, passing: 86, dribbling: 88, defense: 76, physical: 76 },
    { id: 28, name: 'Alejandro Balde', position: 'LB', nation: '🇪🇸', club: 'Barcelona', rating: 84, pace: 96, shooting: 60, passing: 78, dribbling: 84, defense: 78, physical: 76 },
    { id: 78, name: 'Pedro Porro', position: 'RB', nation: '🇪🇸', club: 'Tottenham', rating: 84, pace: 86, shooting: 76, passing: 82, dribbling: 82, defense: 78, physical: 74 },
    { id: 79, name: 'Pau Cubarsí', position: 'CB', nation: '🇪🇸', club: 'Barcelona', rating: 82, pace: 72, shooting: 40, passing: 84, dribbling: 70, defense: 83, physical: 76 },
    { id: 80, name: 'Marc Cucurella', position: 'LB', nation: '🇪🇸', club: 'Chelsea', rating: 84, pace: 82, shooting: 62, passing: 80, dribbling: 80, defense: 82, physical: 78 },

    // Germany
    { id: 29, name: 'Jamal Musiala', position: 'CAM', nation: '🇩🇪', club: 'Bayern Munich', rating: 91, pace: 86, shooting: 84, passing: 86, dribbling: 94, defense: 52, physical: 72 },
    { id: 30, name: 'Florian Wirtz', position: 'CAM', nation: '🇩🇪', club: 'Bayer Leverkusen', rating: 90, pace: 84, shooting: 84, passing: 90, dribbling: 93, defense: 52, physical: 72 },
    { id: 31, name: 'Leroy Sané', position: 'RW', nation: '🇩🇪', club: 'Bayern Munich', rating: 89, pace: 95, shooting: 84, passing: 83, dribbling: 88, defense: 40, physical: 75 },
    { id: 32, name: 'Antonio Rüdiger', position: 'CB', nation: '🇩🇪', club: 'Real Madrid', rating: 88, pace: 84, shooting: 58, passing: 72, dribbling: 70, defense: 90, physical: 89 },

    // Portugal
    { id: 33, name: 'Cristiano Ronaldo', position: 'ST', nation: '🇵🇹', club: 'Al-Nassr', rating: 90, pace: 82, shooting: 93, passing: 82, dribbling: 88, defense: 35, physical: 78 },
    { id: 34, name: 'Bruno Fernandes', position: 'CAM', nation: '🇵🇹', club: 'Manchester United', rating: 88, pace: 72, shooting: 82, passing: 90, dribbling: 85, defense: 60, physical: 75 },
    { id: 35, name: 'Rúben Dias', position: 'CB', nation: '🇵🇹', club: 'Manchester City', rating: 92, pace: 72, shooting: 58, passing: 78, dribbling: 70, defense: 94, physical: 90 },
    { id: 36, name: 'João Cancelo', position: 'LB', nation: '🇵🇹', club: 'Barcelona', rating: 89, pace: 88, shooting: 78, passing: 90, dribbling: 88, defense: 78, physical: 76 },
    { id: 37, name: 'Bernardo Silva', position: 'CAM', nation: '🇵🇹', club: 'Manchester City', rating: 91, pace: 78, shooting: 82, passing: 90, dribbling: 94, defense: 66, physical: 70 },

    // Netherlands
    { id: 38, name: 'Virgil van Dijk', position: 'CB', nation: '🇳🇱', club: 'Liverpool', rating: 91, pace: 76, shooting: 62, passing: 74, dribbling: 72, defense: 95, physical: 92 },
    { id: 39, name: 'Cody Gakpo', position: 'LW', nation: '🇳🇱', club: 'Liverpool', rating: 86, pace: 88, shooting: 82, passing: 80, dribbling: 85, defense: 45, physical: 84 },
    { id: 40, name: 'Matthijs de Ligt', position: 'CB', nation: '🇳🇱', club: 'Bayern Munich', rating: 87, pace: 78, shooting: 60, passing: 74, dribbling: 72, defense: 89, physical: 87 },
    { id: 41, name: 'Nathan Aké', position: 'CB', nation: '🇳🇱', club: 'Manchester City', rating: 86, pace: 82, shooting: 52, passing: 74, dribbling: 72, defense: 88, physical: 82 },

    // Belgium
    { id: 42, name: 'Kevin De Bruyne', position: 'CM', nation: '🇧🇪', club: 'Manchester City', rating: 93, pace: 72, shooting: 89, passing: 98, dribbling: 88, defense: 68, physical: 78 },
    { id: 43, name: 'Thibaut Courtois', position: 'GK', nation: '🇧🇪', club: 'Real Madrid', rating: 92, pace: 52, shooting: 20, passing: 72, dribbling: 60, defense: 30, physical: 90, diving: 92, handling: 91, kicking: 82, positioning: 90, reflexes: 93 },

    // Croatia
    { id: 44, name: 'Luka Modrić', position: 'CM', nation: '🇭🇷', club: 'Real Madrid', rating: 90, pace: 68, shooting: 78, passing: 92, dribbling: 91, defense: 76, physical: 68 },

    // Uruguay
    { id: 45, name: 'Federico Valverde', position: 'CM', nation: '🇺🇾', club: 'Real Madrid', rating: 90, pace: 88, shooting: 84, passing: 84, dribbling: 86, defense: 78, physical: 88 },
    { id: 46, name: 'Darwin Núñez', position: 'ST', nation: '🇺🇾', club: 'Liverpool', rating: 82, pace: 92, shooting: 82, passing: 70, dribbling: 78, defense: 40, physical: 86 },

    // Colombia
    { id: 47, name: 'Luis Díaz', position: 'LW', nation: '🇨🇴', club: 'Liverpool', rating: 87, pace: 95, shooting: 80, passing: 78, dribbling: 88, defense: 40, physical: 75 },

    // Ecuador
    { id: 48, name: 'Moisés Caicedo', position: 'CDM', nation: '🇪🇨', club: 'Chelsea', rating: 84, pace: 78, shooting: 65, passing: 78, dribbling: 80, defense: 85, physical: 85 },

    // Mexico
    { id: 49, name: 'Raúl Jiménez', position: 'ST', nation: '🇲🇽', club: 'Fulham', rating: 79, pace: 72, shooting: 80, passing: 65, dribbling: 70, defense: 40, physical: 85 },
    { id: 50, name: 'Hirving Lozano', position: 'RW', nation: '🇲🇽', club: 'PSV', rating: 82, pace: 91, shooting: 78, passing: 72, dribbling: 85, defense: 35, physical: 70 },

    // USA
    { id: 51, name: 'Christian Pulisic', position: 'LW', nation: '🇺🇸', club: 'AC Milan', rating: 82, pace: 89, shooting: 75, passing: 78, dribbling: 86, defense: 40, physical: 68 },
    { id: 52, name: 'Weston McKennie', position: 'CM', nation: '🇺🇸', club: 'Juventus', rating: 80, pace: 82, shooting: 72, passing: 75, dribbling: 78, defense: 70, physical: 85 },

    // Canada
    { id: 53, name: 'Alphonso Davies', position: 'LB', nation: '🇨🇦', club: 'Bayern Munich', rating: 89, pace: 99, shooting: 70, passing: 80, dribbling: 88, defense: 76, physical: 84 },

    // Japan
    { id: 54, name: 'Takefusa Kubo', position: 'RW', nation: '🇯🇵', club: 'Real Sociedad', rating: 81, pace: 86, shooting: 75, passing: 78, dribbling: 88, defense: 40, physical: 65 },

    // South Korea
    { id: 55, name: 'Son Heung-min', position: 'LW', nation: '🇰🇷', club: 'Tottenham', rating: 88, pace: 92, shooting: 87, passing: 80, dribbling: 86, defense: 40, physical: 75 },
    { id: 56, name: 'Kim Min-jae', position: 'CB', nation: '🇰🇷', club: 'Bayern Munich', rating: 89, pace: 80, shooting: 56, passing: 74, dribbling: 72, defense: 90, physical: 88 },

     // Senegal
    { id: 57, name: 'Sadio Mané', position: 'LW', nation: '🇸🇳', club: 'Al-Nassr', rating: 88, pace: 92, shooting: 84, passing: 80, dribbling: 90, defense: 40, physical: 78 },

    // Morocco
    { id: 58, name: 'Achraf Hakimi', position: 'RB', nation: '🇲🇦', club: 'Paris Saint-Germain', rating: 86, pace: 95, shooting: 75, passing: 82, dribbling: 85, defense: 75, physical: 80 },

    // Egypt
    { id: 59, name: 'Mohamed Salah', position: 'RW', nation: '🇪🇬', club: 'Liverpool', rating: 90, pace: 93, shooting: 89, passing: 84, dribbling: 90, defense: 45, physical: 78 },

    // Paraguay
    { id: 60, name: 'Miguel Almirón', position: 'RW', nation: '🇵🇾', club: 'Newcastle United', rating: 78, pace: 92, shooting: 74, passing: 70, dribbling: 82, defense: 38, physical: 75 },

    // New Zealand
    { id: 61, name: 'Chris Wood', position: 'ST', nation: '🇳🇿', club: 'Nottingham Forest', rating: 76, pace: 75, shooting: 78, passing: 65, dribbling: 70, defense: 40, physical: 88 },

    // Jordan
    { id: 62, name: 'Mousa Al-Tamari', position: 'RW', nation: '🇯🇴', club: 'Montpellier', rating: 73, pace: 88, shooting: 70, passing: 72, dribbling: 82, defense: 35, physical: 70 },

    // Uzbekistan
    { id: 63, name: 'Jaloliddin Masharipov', position: 'LW', nation: '🇺🇿', club: 'PFC Krylia Sovetov', rating: 71, pace: 85, shooting: 68, passing: 75, dribbling: 80, defense: 35, physical: 68 },

    // Switzerland
    { id: 64, name: 'Granit Xhaka', position: 'CM', nation: '🇨🇭', club: 'Bayer Leverkusen', rating: 82, pace: 65, shooting: 75, passing: 85, dribbling: 78, defense: 72, physical: 85 },

    // Scotland
    { id: 65, name: 'Andrew Robertson', position: 'LB', nation: '🏴', club: 'Liverpool', rating: 83, pace: 82, shooting: 65, passing: 85, dribbling: 78, defense: 75, physical: 80 },

    // Sweden
    { id: 66, name: 'Victor Lindelöf', position: 'CB', nation: '🇸🇪', club: 'Manchester United', rating: 84, pace: 75, shooting: 54, passing: 78, dribbling: 72, defense: 85, physical: 80 },

    // Czech Republic
    { id: 67, name: 'Patrik Schick', position: 'ST', nation: '🇨🇿', club: 'Bayer Leverkusen', rating: 81, pace: 82, shooting: 82, passing: 68, dribbling: 75, defense: 38, physical: 85 },

    // Australia
    { id: 68, name: 'Mathew Ryan', position: 'GK', nation: '🇦🇺', club: 'AZ', rating: 78, pace: 60, shooting: 20, passing: 70, dribbling: 55, defense: 25, physical: 78, diving: 82, handling: 80, kicking: 75, positioning: 80, reflexes: 82 },

    // Iran
    { id: 69, name: 'Mehdi Taremi', position: 'ST', nation: '🇮🇷', club: 'Inter Milan', rating: 80, pace: 78, shooting: 82, passing: 72, dribbling: 76, defense: 40, physical: 82 },

    // Saudi Arabia
    { id: 70, name: 'Salem Al-Dawsari', position: 'RW', nation: '🇸🇦', club: 'Al-Hilal', rating: 76, pace: 82, shooting: 75, passing: 70, dribbling: 78, defense: 35, physical: 70 },

    // Qatar
    { id: 71, name: 'Akram Afif', position: 'LW', nation: '🇶🇦', club: 'Al-Sadd', rating: 74, pace: 85, shooting: 72, passing: 74, dribbling: 80, defense: 30, physical: 68 },

    // Ghana
    { id: 72, name: 'Thomas Partey', position: 'CDM', nation: '🇬🇭', club: 'Arsenal', rating: 83, pace: 78, shooting: 72, passing: 78, dribbling: 80, defense: 85, physical: 88 },

    // Tunisia
    { id: 73, name: 'Wahbi Khazri', position: 'ST', nation: '🇹🇳', club: 'Montpellier', rating: 76, pace: 78, shooting: 76, passing: 72, dribbling: 78, defense: 38, physical: 75 },

    // Algeria
    { id: 74, name: 'Riyad Mahrez', position: 'RW', nation: '🇩🇿', club: 'Al-Ahli', rating: 84, pace: 82, shooting: 80, passing: 85, dribbling: 90, defense: 40, physical: 65 },

    // Mali
    { id: 75, name: 'Mohamed Camara', position: 'CDM', nation: '🇲🇱', club: 'Monaco', rating: 78, pace: 80, shooting: 65, passing: 75, dribbling: 78, defense: 82, physical: 85 },

    // Ivory Coast
    { id: 76, name: 'Sébastien Haller', position: 'ST', nation: '🇨🇮', club: 'Borussia Dortmund', rating: 81, pace: 80, shooting: 82, passing: 70, dribbling: 75, defense: 40, physical: 88 },

    // Uzbekistan extra
    { id: 77, name: 'Abbosbek Fayzullaev', position: 'RW', nation: '🇺🇿', club: 'CSKA Moscow', rating: 78, pace: 84, shooting: 75, passing: 78, dribbling: 83, defense: 35, physical: 65 },

    // Norway
    { id: 82, name: 'Erling Haaland', position: 'ST', nation: '🇳🇴', club: 'Manchester City', rating: 91, pace: 89, shooting: 94, passing: 70, dribbling: 82, defense: 45, physical: 94 }
];

// Formations
const FORMATIONS = {
    '4-3-3': {
        positions: ['GK', 'RB', 'CB1', 'CB2', 'LB', 'CM', 'CM1', 'CM2', 'RW', 'ST', 'LW'],
        layout: [
            ['GK'],
            ['RB', 'CB1', 'CB2', 'LB'],
            ['CM', 'CM1', 'CM2'],
            ['RW', 'ST', 'LW']
        ]
    },
    '4-4-2': {
        positions: ['GK', 'RB', 'CB1', 'CB2', 'LB', 'RM', 'CM1', 'CM2', 'LM', 'ST', 'ST1'],
        layout: [
            ['GK'],
            ['RB', 'CB1', 'CB2', 'LB'],
            ['RM', 'CM1', 'CM2', 'LM'],
            ['ST', 'ST1']
        ]
    },
    '3-5-2': {
        positions: ['GK', 'CB1', 'CB2', 'CB3', 'RWB', 'CM1', 'CM', 'CM', 'LWB', 'ST', 'ST1'],
        layout: [
            ['GK'],
            ['CB1', 'CB2', 'CB3'],
            ['RWB', 'CM1', 'CM', 'CM', 'LWB'],
            ['ST', 'ST1']
        ]
    },
    '5-3-2': {
        positions: ['GK', 'RWB', 'CB1', 'CB2', 'CB3', 'CB4', 'LWB', 'CM1', 'CM2', 'CM3', 'ST1', 'ST'],
        layout: [
            ['GK'],
            ['RWB', 'CB1', 'CB2', 'CB3', 'CB4', 'LWB'],
            ['CM1', 'CM2', 'CM3'],
            ['ST1', 'ST']
        ]
    },
    '4-2-3-1': {
        positions: ['GK', 'RB', 'CB1', 'CB2', 'LB', 'CDM1', 'CDM2', 'CAM', 'RW', 'ST', 'LW'],
        layout: [
            ['GK'],
            ['RB', 'CB1', 'CB2', 'LB'],
            ['CDM1', 'CDM2'],
            ['CAM'],
            ['RW', 'ST', 'LW']
        ]
    }
};
