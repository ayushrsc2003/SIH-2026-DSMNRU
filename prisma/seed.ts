import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.member.deleteMany({});
  await prisma.team.deleteMany({});

  // Seed Team 1: Team CodeCRUD (Past Finalist homage)
  const team1 = await prisma.team.create({
    data: {
      teamId: 'SIH26-89201',
      teamName: 'CodeCRUD',
      domain: 'Smart Education',
      ideaSummary: 'AI-driven personalized learning assistant for differently-abled university students with real-time speech and gesture parsing.',
      mentorName: 'Dr. Rahul Sharma',
      mentorDept: 'Computer Science & Engineering',
      members: {
        create: [
          {
            name: 'Md. Afnan',
            branch: 'B.Tech CSE',
            year: '4th Year',
            universityId: 'DSMNRU/2022/CSE/014',
            gender: 'Male',
            email: 'afnan_csebtech22_014@dsmnru.ac.in',
            phone: '9876543210',
            isLeader: true,
          },
          {
            name: 'Ananya Verma',
            branch: 'B.Tech CSE',
            year: '4th Year',
            universityId: 'DSMNRU/2022/CSE/022',
            gender: 'Female',
            email: 'ananya_csebtech22_022@dsmnru.ac.in',
            phone: '9876543211',
            isLeader: false,
          },
          {
            name: 'Rohan Gupta',
            branch: 'B.Tech AI & Data Science',
            year: '3rd Year',
            universityId: 'DSMNRU/2023/AIDS/005',
            gender: 'Male',
            email: 'rohan_aids23_005@dsmnru.ac.in',
            phone: '9876543212',
            isLeader: false,
          },
          {
            name: 'Priya Srivastava',
            branch: 'B.Tech CSE',
            year: '3rd Year',
            universityId: 'DSMNRU/2023/CSE/041',
            gender: 'Female',
            email: 'priya_csebtech23_041@dsmnru.ac.in',
            phone: '9876543213',
            isLeader: false,
          },
          {
            name: 'Shivam Pandey',
            branch: 'B.Tech ECE',
            year: '4th Year',
            universityId: 'DSMNRU/2022/ECE/009',
            gender: 'Male',
            email: 'shivam_ece22_009@dsmnru.ac.in',
            phone: '9876543214',
            isLeader: false,
          },
          {
            name: 'Utkarsh Rai',
            branch: 'M.Tech CSE',
            year: '1st Year',
            universityId: 'DSMNRU/2025/MTECH/002',
            gender: 'Male',
            email: 'utkarsh_mtech25_002@dsmnru.ac.in',
            phone: '9876543215',
            isLeader: false,
          },
        ],
      },
    },
    include: { members: true },
  });

  // Seed Team 2: Team Emotispeak (Past Finalist homage)
  const team2 = await prisma.team.create({
    data: {
      teamId: 'SIH26-44192',
      teamName: 'Emotispeak',
      domain: 'MedTech / Healthcare',
      ideaSummary: 'Assistive emotion-to-speech communication interface designed for non-verbal individuals using neural signal processing.',
      mentorName: 'Ms. Shalini Raghuvanshi',
      mentorDept: 'Computer Science & Engineering',
      members: {
        create: [
          {
            name: 'Ayush Chaurasiya',
            branch: 'B.Tech CSE',
            year: '4th Year',
            universityId: 'DSMNRU/2022/CSE/041',
            gender: 'Male',
            email: 'achaurasiya_csebtech23_041@dsmnru.ac.in',
            phone: '7838504972',
            isLeader: true,
          },
          {
            name: 'Sneha Patel',
            branch: 'B.Tech CSE',
            year: '4th Year',
            universityId: 'DSMNRU/2022/CSE/089',
            gender: 'Female',
            email: 'sneha_csebtech22_089@dsmnru.ac.in',
            phone: '9123456780',
            isLeader: false,
          },
          {
            name: 'Divyansh Singh',
            branch: 'B.Tech AI & Data Science',
            year: '3rd Year',
            universityId: 'DSMNRU/2023/AIDS/018',
            gender: 'Male',
            email: 'divyansh_aids23_018@dsmnru.ac.in',
            phone: '9123456781',
            isLeader: false,
          },
          {
            name: 'Kavya Tripathi',
            branch: 'B.Tech ECE',
            year: '3rd Year',
            universityId: 'DSMNRU/2023/ECE/012',
            gender: 'Female',
            email: 'kavya_ece23_012@dsmnru.ac.in',
            phone: '9123456782',
            isLeader: false,
          },
          {
            name: 'Alok Kumar',
            branch: 'B.Tech Mechanical Engineering',
            year: '4th Year',
            universityId: 'DSMNRU/2022/ME/030',
            gender: 'Male',
            email: 'alok_me22_030@dsmnru.ac.in',
            phone: '9123456783',
            isLeader: false,
          },
          {
            name: 'Vikas Mishra',
            branch: 'BCA',
            year: '3rd Year',
            universityId: 'DSMNRU/2023/BCA/055',
            gender: 'Male',
            email: 'vikas_bca23_055@dsmnru.ac.in',
            phone: '9123456784',
            isLeader: false,
          },
        ],
      },
    },
    include: { members: true },
  });

  // Seed Team 3: Team CyberShield
  const team3 = await prisma.team.create({
    data: {
      teamId: 'SIH26-10493',
      teamName: 'CyberShield',
      domain: 'Cyber Security',
      ideaSummary: 'Decentralized blockchain credential verification platform to prevent fake degree certificates and academic fraud.',
      mentorName: 'Er. Alok Agrawal',
      mentorDept: 'Information Technology',
      members: {
        create: [
          {
            name: 'Ritika Saxena',
            branch: 'B.Tech IT',
            year: '4th Year',
            universityId: 'DSMNRU/2022/IT/003',
            gender: 'Female',
            email: 'ritika_it22_003@dsmnru.ac.in',
            phone: '9988776655',
            isLeader: true,
          },
          {
            name: 'Aman Dubey',
            branch: 'B.Tech IT',
            year: '4th Year',
            universityId: 'DSMNRU/2022/IT/015',
            gender: 'Male',
            email: 'aman_it22_015@dsmnru.ac.in',
            phone: '9988776654',
            isLeader: false,
          },
          {
            name: 'Shreya Tiwari',
            branch: 'MCA',
            year: '2nd Year',
            universityId: 'DSMNRU/2024/MCA/010',
            gender: 'Female',
            email: 'shreya_mca24_010@dsmnru.ac.in',
            phone: '9988776653',
            isLeader: false,
          },
          {
            name: 'Harsh Vardhan',
            branch: 'B.Tech CSE',
            year: '3rd Year',
            universityId: 'DSMNRU/2023/CSE/067',
            gender: 'Male',
            email: 'harsh_csebtech23_067@dsmnru.ac.in',
            phone: '9988776652',
            isLeader: false,
          },
          {
            name: 'Yash Srivastava',
            branch: 'B.Tech CSE',
            year: '2nd Year',
            universityId: 'DSMNRU/2024/CSE/099',
            gender: 'Male',
            email: 'yash_csebtech24_099@dsmnru.ac.in',
            phone: '9988776651',
            isLeader: false,
          },
          {
            name: 'Nikhil Chauhan',
            branch: 'B.Tech AI & Data Science',
            year: '2nd Year',
            universityId: 'DSMNRU/2024/AIDS/044',
            gender: 'Male',
            email: 'nikhil_aids24_044@dsmnru.ac.in',
            phone: '9988776650',
            isLeader: false,
          },
        ],
      },
    },
    include: { members: true },
  });

  console.log(`✅ Seeding complete! Created 3 teams:`);
  console.log(` - ${team1.teamName} (${team1.teamId})`);
  console.log(` - ${team2.teamName} (${team2.teamId})`);
  console.log(` - ${team3.teamName} (${team3.teamId})`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
