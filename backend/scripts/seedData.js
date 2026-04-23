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

                const newDoc = await Doctor.create({
                    name: `Dr. ${name}`,
                    email: `dr.${user.email}`, // Prepending dr. to ensure unique role-based email if needed
                    password: 'password123',
                    role: 'doctor',
                    specialty: spec,
                    experienceYears: getRandomInt(5, 30),
                    consultationFee: getRandomInt(300, 1500),
                    address: addresses[getRandomInt(0, addresses.length - 1)],
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