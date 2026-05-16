const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const https = require('https');

// Models
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');
const Appointment = require('../src/models/Appointment');
const Review = require('../src/models/Review');
const Prescription = require('../src/models/Prescription');
const Specialty = require('../src/models/Specialty');

dotenv.config({ path: path.join(__dirname, '../.env') });

const specialties = [
    'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist',
    'Orthopedic', 'Gynecologist', 'Psychiatrist', 'Ophthalmologist', 'Dentist',
    'ENT Specialist', 'Gastroenterologist', 'Urologist', 'Pulmonologist', 'Endocrinologist',
    'Oncologist', 'Nephrologist', 'Rheumatologist', 'Hematologist', 'Allergist',
    'Immunologist', 'Sexologist', 'Physiotherapist', 'Nutritionist', 'Radiologist',
    'Anesthesiologist', 'Surgeon', 'Plastic Surgeon', 'Emergency Medicine Specialist', 'Infectious Disease Specialist'
];

// Indore hospital addresses with real GPS coordinates [lng, lat] — GeoJSON order
const addresses = [
    { address: 'Choithram Hospital & Research Centre, Manik Bagh Road, Indore', coordinates: [75.8767, 22.7273] },
    { address: 'Bombay Hospital, South Tukoganj, Indore', coordinates: [75.8760, 22.7236] },
    { address: 'Apollo Hospitals, Scheme 54, AB Road, Indore', coordinates: [75.8956, 22.7500] },
    { address: 'CHL Hospital, AB Road, Scheme 54, Indore', coordinates: [75.8702, 22.7197] },
    { address: 'Medanta Hospital, Bicholi Mardana, Indore', coordinates: [75.8856, 22.7489] },
    { address: 'Unique Hospital, Vijay Nagar Square, Indore', coordinates: [75.9022, 22.7511] },
    { address: 'Bhandari Hospital & Research Centre, Palasia, Indore', coordinates: [75.8683, 22.7260] },
    { address: 'Vishesh Jupiter Hospital, Scheme 94C, Ring Road, Indore', coordinates: [75.8803, 22.7412] },
    { address: 'SAIMS Hospital, Sanwer Road, Indore', coordinates: [75.8246, 22.7523] },
    { address: 'Care CHL Hospitals, AB Road, Indore', coordinates: [75.8696, 22.7190] },
    { address: 'Gokuldas Hospital, MG Road, Indore', coordinates: [75.8580, 22.7167] },
    { address: 'Arihant Hospital, Scheme 140, Nipania, Indore', coordinates: [75.8924, 22.7624] },
    { address: 'Index Medical College & Hospital, Pigdamber, Rau, Indore', coordinates: [75.9063, 22.7872] },
    { address: 'Kasliwal Hospital, MG Road, Old Palasia, Indore', coordinates: [75.8577, 22.7197] },
    { address: 'Kokilaben Hospital, Bhanwarkuan Main Road, Indore', coordinates: [75.8750, 22.7045] },
];

const patientAddresses = [
    'Vijay Nagar, Indore',
    'Palasia, Indore',
    'Scheme 54, Indore',
    'Bhanwarkuan, Indore',
    'South Tukoganj, Indore',
    'MG Road, Indore',
    'Rau, Indore',
    'Nipania, Indore',
    'Bhawarkuan, Indore',
    'Rajwada, Indore'
];


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fetch random users from randomuser.me
const fetchRandomUsers = (count) => {
    return new Promise((resolve, reject) => {
        https.get(`https://randomuser.me/api/?results=${count}&nat=in`, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data).results);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

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
        await Specialty.deleteMany({});

        console.log('Fetching random users from randomuser.me...');
        const randomUsers = await fetchRandomUsers(150); // Sufficient for 30 specialties * 3 doctors + patients
        let userIdx = 0;

        console.log('Generating Specialties...');
        const specialtyDocs = await Specialty.insertMany(
            specialties.map(spec => ({ name: spec, description: `Specialist in ${spec}` }))
        );
        console.log(`Inserted ${specialtyDocs.length} specialties.`);

        // 1. Create Doctors (Care Partners)
        console.log('Generating Doctors (3 per Specialty using randomuser.me)...');
        const insertedDoctors = [];
        for (const spec of specialties) {
            for (let i = 0; i < 3; i++) {
                const user = randomUsers[userIdx++];
                const name = `${user.name.first} ${user.name.last}`;

                const selectedAddress = addresses[getRandomInt(0, addresses.length - 1)];
                const newDoc = await Doctor.create({
                    name: `Dr. ${name}`,
                    email: `dr.${user.email}`,
                    password: 'password123',
                    role: 'doctor',
                    specialty: spec,
                    experienceYears: getRandomInt(5, 30),
                    consultationFee: getRandomInt(300, 1500),
                    address: selectedAddress.address,
                    location: {
                        type: 'Point',
                        coordinates: selectedAddress.coordinates // [lng, lat] GeoJSON format
                    },
                    averageRating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
                    totalReviews: getRandomInt(10, 150),
                    totalPatients: getRandomInt(100, 2000),
                    profilePhoto: user.picture.large,
                    bio: `I am a dedicated medical professional committed to providing the best care for my patients. Specialized in ${spec}.`,
                    isAvailable: true,
                    isEmailVerified: true,
                    isVerified: true,
                    availability: [
                        { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'] },
                        { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'] },
                        { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '02:00 PM', '04:00 PM'] },
                        { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '02:00 PM', '04:00 PM'] },
                        { day: 'Friday', slots: ['10:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'] },
                        { day: 'Saturday', slots: ['10:00 AM'] }
                    ]
                });
                insertedDoctors.push(newDoc);
            }
        }
        console.log(`Inserted ${insertedDoctors.length} doctors.`);

        // 2. Create Patients
        console.log('Generating Patients using randomuser.me...');
        const insertedPatients = [];
        for (let i = 0; i < 20; i++) {
            const user = randomUsers[userIdx++];
            const name = `${user.name.first} ${user.name.last}`;

            const newUser = await User.create({
                name: name,
                email: user.email,
                password: 'password123',
                role: 'patient',
                age: getRandomInt(18, 70),
                gender: user.gender.charAt(0).toUpperCase() + user.gender.slice(1),
                phone: user.phone,
                address: patientAddresses[getRandomInt(0, patientAddresses.length - 1)],
                profilePhoto: user.picture.large,
                medicalNotes: 'No significant medical history.',
                isEmailVerified: true
            });
            insertedPatients.push(newUser);
        }
        console.log(`Inserted ${insertedPatients.length} patients.`);

        // 3. Create Appointments
        console.log('Generating Appointments...');
        const insertedAppointments = [];
        for (let i = 0; i < 30; i++) {
            const randomDoctor = insertedDoctors[getRandomInt(0, insertedDoctors.length - 1)];
            const randomPatient = insertedPatients[getRandomInt(0, insertedPatients.length - 1)];

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
        const reviewsToInsert = [];
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

        // 5. Create some Prescriptions
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