const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
// Models
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');
const Appointment = require('../src/models/Appointment');
const Review = require('../src/models/Review');
const Prescription = require('../src/models/Prescription');
dotenv.config({ path: path.join(__dirname, '../.env') });
// Dummy data generation arrays
const specialties = ['Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic', 'General Physician', 'Gynecologist', 'Psychiatrist', 'Ophthalmologist', 'Dentist'];
const indianFirstNamesM = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Dhruv', 'Kabir', 'Ritvik'];
const indianFirstNamesF = ['Aadhya', 'Diya', 'Kashvi', 'Ananya', 'Pari', 'Avni', 'Gauri', 'Isha', 'Riya', 'Aanya', 'Saanvi', 'Myra', 'Kriti', 'Neha', 'Priya'];
const indianLastNames = ['Sharma', 'Verma', 'Singh', 'Patel', 'Reddy', 'Kumar', 'Gupta', 'Rao', 'Desai', 'Jain', 'Mehta', 'Kaur', 'Nair', 'Menon', 'Bose'];
const addresses = [
    'Apollo Hospitals, Jubilee Hills, Hyderabad',
    'Fortis Hospital, Bannerghatta Road, Bangalore',
    'Max Super Speciality Hospital, Saket, New Delhi',
    'Lilavati Hospital, Bandra West, Mumbai',
    'Manipal Hospital, Old Airport Road, Bangalore',
    'Medanta - The Medicity, Gurugram',
    'Kokilaben Dhirubhai Ambani Hospital, Andheri West, Mumbai',
    'Artemis Hospital, Sector 51, Gurugram',
    'KIMS Hospitals, Secunderabad',
    'PGIMER, Sector 12, Chandigarh',
    'Christian Medical College, Vellore',
    'Care Hospitals, Banjara Hills, Hyderabad',
    'Sir Ganga Ram Hospital, Rajinder Nagar, New Delhi',
    'Sankara Nethralaya, Nungambakkam, Chennai',
    'Tata Memorial Hospital, Parel, Mumbai'
];
const patientAddresses = [
    'Koramangala, Bangalore',
    'Andheri East, Mumbai',
    'Connaught Place, New Delhi',
    'Banjara Hills, Hyderabad',
    'Anna Nagar, Chennai',
    'Salt Lake City, Kolkata',
    'Viman Nagar, Pune',
    'Navrangpura, Ahmedabad',
    'Gomti Nagar, Lucknow',
    'Sector 17, Chandigarh'
];
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateName(gender = 'M') {
    const fn = gender === 'M' ? indianFirstNamesM[getRandomInt(0, indianFirstNamesM.length - 1)] : indianFirstNamesF[getRandomInt(0, indianFirstNamesF.length - 1)];
    const ln = indianLastNames[getRandomInt(0, indianLastNames.length - 1)];
    return `${fn} ${ln}`;
}
const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');
        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({ role: 'patient' });
        await Doctor.deleteMany({});
        await Appointment.deleteMany({});
        await Review.deleteMany({});
        await Prescription.deleteMany({});
        // 1. Create Doctors (Care Partners)
        console.log('Generating Doctors...');
        const insertedDoctors = [];
        for (let i = 0; i < 15; i++) {
            const gender = Math.random() > 0.5 ? 'M' : 'F';
            const name = generateName(gender);
            const newDoc = await Doctor.create({
                name: `Dr. ${name}`,
                email: `dr.${name.toLowerCase().replace(' ', '.')}@example.com`,
                password: 'password123',
                role: 'doctor',
                specialty: specialties[getRandomInt(0, specialties.length - 1)],
                experienceYears: getRandomInt(5, 30),
                consultationFee: getRandomInt(300, 1500),
                address: addresses[i],
                averageRating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
                totalReviews: getRandomInt(10, 150),
                totalPatients: getRandomInt(100, 2000),
                profilePhoto: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random&color=fff`,
                bio: `I am a dedicated medical professional committed to providing the best care for my patients.`,
                isAvailable: true,
                availability: [
                    { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'] },
                    { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '02:00 PM', '04:00 PM'] },
                    { day: 'Friday', slots: ['10:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'] }
                ]
            });
            insertedDoctors.push(newDoc);
        }
        console.log(`Inserted ${insertedDoctors.length} doctors.`);
        // 2. Create Patients
        console.log('Generating Patients...');
        const insertedPatients = [];
        for (let i = 0; i < 15; i++) {
            const gender = Math.random() > 0.5 ? 'M' : 'F';
            const name = generateName(gender);
            const newUser = await User.create({
                name: name,
                email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
                password: 'password123',
                role: 'patient',
                age: getRandomInt(18, 70),
                gender: gender === 'M' ? 'Male' : 'Female',
                phone: `+91 ${getRandomInt(9000000000, 9999999999)}`,
                address: patientAddresses[getRandomInt(0, patientAddresses.length - 1)],
                profilePhoto: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random&color=fff`,
                medicalNotes: 'No significant medical history.'
            });
            insertedPatients.push(newUser);
        }
        console.log(`Inserted ${insertedPatients.length} patients.`);
        // 3. Create Appointments
        console.log('Generating Appointments...');
        const insertedAppointments = [];
        for (let i = 0; i < 20; i++) {
            const randomDoctor = insertedDoctors[getRandomInt(0, insertedDoctors.length - 1)];
            const randomPatient = insertedPatients[getRandomInt(0, insertedPatients.length - 1)];

            // Randomize past vs future appointments
            const isPast = Math.random() > 0.5;
            const daysOffset = getRandomInt(1, 14);
            const appointmentDate = new Date(Date.now() + (isPast ? -1 : 1) * daysOffset * 24 * 60 * 60 * 1000);

            const aptStatus = isPast ? 'completed' : (Math.random() > 0.5 ? 'confirmed' : 'pending');
            const ptStatus = aptStatus === 'completed' || aptStatus === 'confirmed' ? 'paid' : 'pending';
            const apt = await Appointment.create({
                patient: randomPatient._id,
                doctor: randomDoctor._id,
                date: appointmentDate,
                timeSlot: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'][getRandomInt(0, 4)],
                status: aptStatus,
                paymentStatus: ptStatus,
                consultationFee: randomDoctor.consultationFee
            });
            insertedAppointments.push(apt);
        }
        console.log(`Inserted ${insertedAppointments.length} appointments.`);
        // 4. Create Reviews
        console.log('Generating Reviews...');
        const reviewsToInsert = [];
        const reviewTexts = [
            "Excellent care and very patient.",
            "Listened carefully and provided great advice.",
            "Wait time was a bit long, but the consultation was good.",
            "Highly recommend this Care Partner!",
            "Very professional and knowledgeable.",
            "Friendly staff and great specialist.",
            "Treatment worked perfectly.",
            "Very satisfied with the visit."
        ];
        for (let i = 0; i < 30; i++) {
            const randomDoctor = insertedDoctors[getRandomInt(0, insertedDoctors.length - 1)];
            const randomPatient = insertedPatients[getRandomInt(0, insertedPatients.length - 1)];
            reviewsToInsert.push({
                doctor: randomDoctor._id,
                patient: randomPatient._id,
                rating: getRandomInt(3, 5),
                comment: reviewTexts[getRandomInt(0, reviewTexts.length - 1)],
                createdAt: new Date(Date.now() - getRandomInt(0, 30) * 24 * 60 * 60 * 1000)
            });
        }
        const insertedReviews = await Review.insertMany(reviewsToInsert);
        console.log(`Inserted ${insertedReviews.length} reviews.`);
        // 5. Create some Prescriptions for past appointments
        console.log('Generating Prescriptions...');
        let prescriptionCount = 0;
        for (const apt of insertedAppointments) {
            if (apt.status === 'completed' && Math.random() > 0.3) {
                const rx = await Prescription.create({
                    appointment: apt._id,
                    doctor: apt.doctor,
                    patient: apt.patient,
                    medicines: [
                        { name: 'Paracetamol', dosage: '1-0-1', duration: '5 days', notes: 'After meals' },
                        { name: 'Amoxicillin', dosage: '1-0-1', duration: '5 days', notes: 'Antibiotic course' }
                    ],
                    generalInstructions: 'Rest well and drink plenty of fluids.'
                });
                apt.prescription = rx._id;
                await apt.save();
                prescriptionCount++;
            }
        }
        console.log(`Inserted ${prescriptionCount} prescriptions.`);
        console.log('Data Seeding Completed Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};
seedData();