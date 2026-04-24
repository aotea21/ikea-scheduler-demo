import { Assembler, AssemblyTask, Order } from './types';

// Mock Locations (Auckland, New Zealand area for demo)
export const LOCATIONS = {
    WAREHOUSE: { lat: -36.9150, lng: 174.8385, address: 'IKEA Mt Wellington Distribution Center' },
    DOWNTOWN: { lat: -36.8485, lng: 174.7633, address: '123 Queen St, Auckland CBD' },
    PONSONBY: { lat: -36.8562, lng: 174.7460, address: '456 Ponsonby Rd, Ponsonby' },
    NEWMARKET: { lat: -36.8687, lng: 174.7770, address: '789 Broadway, Newmarket' },
    TAKAPUNA: { lat: -36.7877, lng: 174.7766, address: '101 Hurstmere Rd, Takapuna' },
    REMUERA: { lat: -36.8797, lng: 174.8055, address: '12 Remuera Rd, Remuera' },
};

export const MOCK_ASSEMBLERS: Assembler[] = [
    {
        id: 'a1',
        name: 'Bjorn Svensson',
        status: 'AVAILABLE',
        skills: ['CABINETRY', 'PLUMBING', 'ELECTRICAL', 'MEASURING', 'COUNTERTOP'],
        certifications: { ELECTRICAL: { number: 'NZ-EW-10234', expiry: '2028-06-30' }, PLUMBING: { number: 'NZ-PL-55678', expiry: '2027-12-31' } },
        rating: 5.0,
        ratingCount: 124,
        currentLocation: { lat: -36.8500, lng: 174.7600, address: '123 CBD Lane, Auckland' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '021 555 0001'
    },
    {
        id: 'a2',
        name: 'Sarah Connor',
        status: 'AVAILABLE',
        skills: ['CABINETRY', 'MEASURING'],
        certifications: {},
        rating: 4.8,
        ratingCount: 89,
        currentLocation: { lat: -36.8550, lng: 174.7450, address: '45 Freemans Bay Rd, Auckland' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '022 555 0002'
    },
    {
        id: 'a3',
        name: 'Mike Ross',
        status: 'AVAILABLE',
        skills: ['CABINETRY'],
        certifications: {},
        rating: 3.5,
        ratingCount: 42,
        currentLocation: { lat: -36.7800, lng: 174.7700, address: '78 Milford Rd, North Shore' },
        availability: [],
        activeTaskId: null,
        isActive: false,
        lastSeenAt: new Date(Date.now() - 3600000), // 1 hour ago
        mobileNumberPrimary: '027 555 0003'
    },
    {
        id: 'a4',
        name: 'Jessica Pearson',
        status: 'AVAILABLE',
        skills: ['CABINETRY', 'PLUMBING', 'ELECTRICAL', 'COUNTERTOP'],
        certifications: { ELECTRICAL: { number: 'NZ-EW-20456', expiry: '2027-08-15' }, PLUMBING: { number: 'NZ-PL-70912', expiry: '2028-03-01' } },
        rating: 4.9,
        ratingCount: 210,
        currentLocation: { lat: -36.8600, lng: 174.7800, address: '12 Remuera Rd, Remuera' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '021 555 0004'
    },
    {
        id: 'a5',
        name: 'Louis Litt',
        status: 'AVAILABLE',
        skills: ['CABINETRY', 'MEASURING'],
        certifications: {},
        rating: 4.2,
        ratingCount: 15,
        currentLocation: { lat: -36.9000, lng: 174.8000, address: '34 Ellerslie Park, Ellerslie' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '022 555 0005'
    },
    {
        id: 'a6',
        name: 'Donna Paulsen',
        status: 'AVAILABLE',
        skills: ['CABINETRY', 'PLUMBING', 'ELECTRICAL', 'MEASURING', 'COUNTERTOP'],
        certifications: { ELECTRICAL: { number: 'NZ-EW-30789', expiry: '2029-01-20' }, PLUMBING: { number: 'NZ-PL-81234', expiry: '2028-09-10' } },
        rating: 5.0,
        ratingCount: 300,
        currentLocation: { lat: -36.8400, lng: 174.7500, address: '56 High St, Downtown' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '027 555 0006'
    },
    {
        id: 'a7',
        name: 'Rachel Green',
        status: 'AVAILABLE',
        skills: ['CABINETRY', 'COUNTERTOP'],
        certifications: {},
        rating: 4.7,
        ratingCount: 156,
        currentLocation: { lat: -36.8900, lng: 174.7900, address: '90 Greenlane Rd, Greenlane' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '021 555 0007',
        mobileNumberSecondary: '09 555 0107'
    },
    {
        id: 'a8',
        name: 'Ross Geller',
        status: 'AVAILABLE',
        skills: ['CABINETRY', 'PLUMBING', 'ELECTRICAL', 'COUNTERTOP'],
        certifications: { ELECTRICAL: { number: 'NZ-EW-40567', expiry: '2027-11-30' }, PLUMBING: { number: 'NZ-PL-91234', expiry: '2028-05-20' } },
        rating: 4.4,
        ratingCount: 78,
        currentLocation: { lat: -36.7650, lng: 174.7550, address: '11 Takapuna Terrace, Takapuna' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '022 555 0008'
    },
    {
        id: 'a9',
        name: 'Monica Bing',
        status: 'AVAILABLE',
        skills: ['CABINETRY', 'MEASURING'],
        certifications: {},
        rating: 4.9,
        ratingCount: 201,
        currentLocation: { lat: -36.8650, lng: 174.8300, address: '22 St Heliers Bay Rd, St Heliers' },
        availability: [],
        activeTaskId: null,
        isActive: false,
        lastSeenAt: new Date(Date.now() - 7200000), // 2 hours ago
        mobileNumberPrimary: '027 555 0009'
    },
    {
        id: 'a10',
        name: 'Chandler Bing',
        status: 'AVAILABLE',
        skills: ['CABINETRY', 'COUNTERTOP'],
        certifications: {},
        rating: 4.6,
        ratingCount: 134,
        currentLocation: { lat: -36.8100, lng: 174.7400, address: '33 Herne Bay Rd, Herne Bay' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '021 555 0010',
        mobileNumberSecondary: '09 555 0210'
    },
];

export const MOCK_ORDERS: Order[] = [
    {
        id: 'o1',
        customerName: 'Alice Johnson',
        address: LOCATIONS.DOWNTOWN,
        items: [
            { id: 'i1', name: 'METOD Base Cabinet Frame 80cm', sku: '802.056.28', quantity: 6 },
            { id: 'i1b', name: 'METOD Wall Cabinet Frame 60cm', sku: '802.056.32', quantity: 4 },
            { id: 'i1c', name: 'EKBACKEN Countertop 246cm', sku: '403.356.15', quantity: 1 }
        ],
        customerPhone: '021 123 4567',
        email: 'alice.j@example.com',
        deliveryFrom: new Date(new Date().setHours(9, 0, 0)),
        deliveryTo: new Date(new Date().setHours(13, 0, 0)),
        deliveryDate: '2025-10-25',
        assemblyWindow: '09:00 - 17:00',
        estimatedTime: 480,
        serviceFee: 2850.00,
        notes: 'L-shape kitchen. Gate code: 1234. Plumbing & electrical pre-checked.',
        status: 'DELIVERED',
        location: LOCATIONS.DOWNTOWN
    },
    {
        id: 'o2',
        customerName: 'Bob Smith',
        address: LOCATIONS.PONSONBY,
        items: [
            { id: 'i2', name: 'KNOXHULT Base Cabinet with Doors 120cm', sku: '703.267.08', quantity: 3 },
            { id: 'i2b', name: 'KNOXHULT Wall Cabinet with Door 60cm', sku: '703.267.12', quantity: 2 },
            { id: 'i2c', name: 'LAGAN Countertop 186cm', sku: '402.530.46', quantity: 1 }
        ],
        customerPhone: '022 987 6543',
        email: 'bob.smith@example.com',
        deliveryFrom: new Date(new Date().setHours(14, 0, 0)),
        deliveryTo: new Date(new Date().setHours(15, 30, 0)),
        deliveryDate: '2025-10-26',
        assemblyWindow: '09:00 - 15:00',
        estimatedTime: 360,
        serviceFee: 1650.00,
        notes: 'Compact galley kitchen. Small dog on property, friendly.',
        status: 'DELIVERED',
        location: LOCATIONS.PONSONBY
    },
    {
        id: 'o3',
        customerName: 'Charlie Davis',
        address: LOCATIONS.NEWMARKET,
        items: [
            { id: 'i3', name: 'METOD High Cabinet for Fridge 60cm', sku: '802.131.87', quantity: 1 },
            { id: 'i3b', name: 'METOD Base Cab for Sink + 2 Doors 80cm', sku: '993.043.67', quantity: 1 }
        ],
        customerPhone: '027 555 1234',
        email: 'charlie.d@example.com',
        deliveryFrom: new Date(new Date().setHours(10, 0, 0)),
        deliveryTo: new Date(new Date().setHours(11, 0, 0)),
        deliveryDate: '2025-10-26',
        assemblyWindow: '10:00 - 14:00',
        estimatedTime: 240,
        serviceFee: 950.00,
        notes: 'Partial kitchen refit — fridge housing + sink base only.',
        status: 'DELIVERED',
        location: LOCATIONS.NEWMARKET
    },
    {
        id: 'o4',
        customerName: 'Diana Prince',
        address: LOCATIONS.REMUERA,
        items: [
            { id: 'i4', name: 'METOD Base Cabinet Frame 60cm', sku: '802.056.26', quantity: 8 },
            { id: 'i4b', name: 'METOD Wall Cabinet Frame 80cm', sku: '802.056.34', quantity: 5 },
            { id: 'i4c', name: 'METOD High Cabinet for Oven 60cm', sku: '802.131.91', quantity: 1 },
            { id: 'i4d', name: 'KASKER Quartz Countertop 300cm', sku: '304.727.18', quantity: 1 },
            { id: 'i4e', name: 'TORNVIKEN Kitchen Island', sku: '903.916.65', quantity: 1 }
        ],
        customerPhone: '021 777 8888',
        email: 'diana.p@example.com',
        deliveryFrom: new Date(new Date().setHours(8, 0, 0)),
        deliveryTo: new Date(new Date().setHours(11, 0, 0)),
        deliveryDate: '2025-10-27',
        assemblyWindow: '08:00 - 18:00',
        estimatedTime: 600,
        serviceFee: 4200.00,
        notes: 'Full U-shape kitchen + island. Use side entrance. Licensed electrician & plumber required.',
        status: 'DELIVERED',
        location: LOCATIONS.REMUERA
    },
    {
        id: 'o5',
        customerName: 'Ethan Hunt',
        address: LOCATIONS.TAKAPUNA,
        items: [
            { id: 'i5', name: 'METOD Base Cabinet Frame 80cm', sku: '802.056.28', quantity: 4 },
            { id: 'i5b', name: 'METOD Wall Cabinet Frame 40cm', sku: '802.056.30', quantity: 3 },
            { id: 'i6', name: 'SÄLJAN Countertop 186cm', sku: '403.357.19', quantity: 1 },
            { id: 'i6b', name: 'HAVSEN Sink Bowl', sku: '191.467.39', quantity: 1 }
        ],
        customerPhone: '021 999 1111',
        email: 'ethan.h@example.com',
        deliveryFrom: new Date(new Date().setHours(9, 30, 0)),
        deliveryTo: new Date(new Date().setHours(12, 0, 0)),
        deliveryDate: '2025-10-28',
        assemblyWindow: '08:00 - 16:00',
        estimatedTime: 480,
        serviceFee: 2100.00,
        notes: 'Straight-line kitchen. Apartment building, elevator access. Sink plumbing hookup needed.',
        status: 'DELIVERED',
        location: LOCATIONS.TAKAPUNA
    },
    {
        id: 'o6',
        customerName: 'Fiona Carter',
        address: LOCATIONS.PONSONBY,
        items: [
            { id: 'i7', name: 'METOD Base Cab for Hob 80cm', sku: '802.568.23', quantity: 1 },
            { id: 'i7b', name: 'METOD Base Cab for Sink 60cm', sku: '802.568.27', quantity: 1 },
            { id: 'i7c', name: 'TILLREDA Portable Induction Hob', sku: '004.396.76', quantity: 1 }
        ],
        customerPhone: '022 222 3333',
        email: 'fiona.c@example.com',
        deliveryFrom: new Date(new Date().setHours(13, 0, 0)),
        deliveryTo: new Date(new Date().setHours(16, 0, 0)),
        deliveryDate: '2025-10-28',
        assemblyWindow: '09:00 - 15:00',
        estimatedTime: 360,
        serviceFee: 1450.00,
        notes: 'Kitchenette install. Hob cutout + sink plumbing required.',
        status: 'DELIVERED',
        location: LOCATIONS.PONSONBY
    },
    {
        id: 'o7',
        customerName: 'George Wilson',
        address: Object.assign({}, LOCATIONS.NEWMARKET, { lat: -36.8700, lng: 174.7780, address: '15 Khyber Pass Rd, Newmarket' }),
        items: [
            { id: 'i8', name: 'METOD Base Cabinet Frame 60cm', sku: '802.056.26', quantity: 5 },
            { id: 'i9', name: 'METOD Wall Cabinet Frame 60cm', sku: '802.056.32', quantity: 3 },
            { id: 'i9b', name: 'FIXA Drill Template', sku: '103.242.71', quantity: 1 }
        ],
        customerPhone: '027 444 5555',
        email: 'george.w@example.com',
        deliveryFrom: new Date(new Date().setHours(10, 0, 0)),
        deliveryTo: new Date(new Date().setHours(12, 0, 0)),
        deliveryDate: '2025-10-29',
        assemblyWindow: '08:00 - 16:00',
        estimatedTime: 480,
        serviceFee: 1950.00,
        notes: 'Office kitchenette on 3rd floor. Freight elevator available.',
        status: 'DELIVERED',
        location: Object.assign({}, LOCATIONS.NEWMARKET, { lat: -36.8700, lng: 174.7780, address: '15 Khyber Pass Rd, Newmarket' })
    },
    {
        id: 'o8',
        customerName: 'Hannah Lee',
        address: Object.assign({}, LOCATIONS.WAREHOUSE, { lat: -36.8950, lng: 174.8200, address: '45 Mt Wellington Hwy' }),
        items: [
            { id: 'i10', name: 'METOD Base Cabinet Frame 80cm', sku: '802.056.28', quantity: 3 },
            { id: 'i10b', name: 'METOD Wall Cabinet Frame 80cm', sku: '802.056.34', quantity: 2 },
            { id: 'i10c', name: 'SÄLJAN Countertop 246cm', sku: '403.357.21', quantity: 1 }
        ],
        customerPhone: '021 666 7777',
        email: 'hannah.l@example.com',
        deliveryFrom: new Date(new Date().setHours(14, 0, 0)),
        deliveryTo: new Date(new Date().setHours(17, 0, 0)),
        deliveryDate: '2025-10-29',
        assemblyWindow: '09:00 - 16:00',
        estimatedTime: 420,
        serviceFee: 1800.00,
        notes: 'Straight-run kitchen. Park on street. Water shutoff valve in garage.',
        status: 'DELIVERED',
        location: Object.assign({}, LOCATIONS.WAREHOUSE, { lat: -36.8950, lng: 174.8200, address: '45 Mt Wellington Hwy' })
    },
    {
        id: 'o9',
        customerName: 'Ian Fraser',
        address: Object.assign({}, LOCATIONS.DOWNTOWN, { lat: -36.8470, lng: 174.7650, address: '88 Fort St, Auckland CBD' }),
        items: [
            { id: 'i11', name: 'KNOXHULT Base Cabinet with Doors 180cm', sku: '703.267.14', quantity: 2 },
            { id: 'i12', name: 'KNOXHULT Wall Cabinet with Door 40cm', sku: '703.267.10', quantity: 2 },
            { id: 'i12b', name: 'LAGAN Countertop 246cm', sku: '402.530.48', quantity: 1 }
        ],
        customerPhone: '022 888 9999',
        email: 'ian.f@example.com',
        deliveryFrom: new Date(new Date().setHours(11, 0, 0)),
        deliveryTo: new Date(new Date().setHours(13, 0, 0)),
        deliveryDate: '2025-10-30',
        assemblyWindow: '09:00 - 15:00',
        estimatedTime: 360,
        serviceFee: 1350.00,
        notes: 'Budget KNOXHULT kitchen. Pre-assembled modules, simpler install.',
        status: 'DELIVERED',
        location: Object.assign({}, LOCATIONS.DOWNTOWN, { lat: -36.8470, lng: 174.7650, address: '88 Fort St, Auckland CBD' })
    },
    {
        id: 'o10',
        customerName: 'Julia Martinez',
        address: LOCATIONS.REMUERA,
        items: [
            { id: 'i13', name: 'METOD Base Cabinet Frame 60cm', sku: '802.056.26', quantity: 10 },
            { id: 'i13b', name: 'METOD Wall Cabinet Frame 80cm', sku: '802.056.34', quantity: 6 },
            { id: 'i13c', name: 'METOD High Cabinet for Oven 60cm', sku: '802.131.91', quantity: 2 },
            { id: 'i13d', name: 'KASKER Quartz Countertop 300cm', sku: '304.727.18', quantity: 2 },
            { id: 'i13e', name: 'HAVSEN Double Bowl Sink', sku: '191.467.41', quantity: 1 }
        ],
        customerPhone: '027 111 2222',
        email: 'julia.m@example.com',
        deliveryFrom: new Date(new Date().setHours(15, 0, 0)),
        deliveryTo: new Date(new Date().setHours(18, 0, 0)),
        deliveryDate: '2025-10-30',
        assemblyWindow: '08:00 - 18:00',
        estimatedTime: 600,
        serviceFee: 5200.00,
        notes: 'Premium full kitchen reno. 2-day install, day 1. Licensed plumber + electrician needed.',
        status: 'DELIVERED',
        location: LOCATIONS.REMUERA
    },
];

export const MOCK_TASKS: AssemblyTask[] = [
    {
        id: 't1',
        orderId: 'o1',
        status: 'ASSIGNED',
        requiredSkills: ['CABINETRY', 'PLUMBING', 'ELECTRICAL'],
        taskType: 'CABINET_INSTALL',
        isKitchenTask: true,
        scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 2),
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 4),
        assignedAssemblerIds: ['a1'],
        createdAt: new Date(),
        estimatedDurationMinutes: 120,
        history: [
            { id: 'e1', taskId: 't1', type: 'ASSIGNED', eventTime: new Date(Date.now() - 3600000), location: { lat: -36.8485, lng: 174.7633, address: 'Previous Location' }, metadata: { assemblerId: 'a1' } }
        ]
    },
    {
        id: 't2',
        orderId: 'o2',
        requiredSkills: ['CABINETRY', 'PLUMBING'],
        taskType: 'CABINET_INSTALL',
        isKitchenTask: true,
        status: 'IN_PROGRESS',
        scheduledStart: new Date(Date.now() - 1000 * 60 * 60),
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 5),
        actualStart: new Date(Date.now() - 1000 * 60 * 60),
        assignedAssemblerIds: ['a2'],
        createdAt: new Date(),
        estimatedDurationMinutes: 360,
        history: [
            { id: 'e2', taskId: 't2', type: 'STARTED', eventTime: new Date(Date.now() - 3600000), location: { lat: -36.8600, lng: 174.7800, address: 'En Route Location' }, metadata: { assemblerId: 'a2' } }
        ]
    },
    {
        id: 't3',
        orderId: 'o3',
        requiredSkills: ['CABINETRY', 'PLUMBING'],
        taskType: 'PLUMBING_INSTALL',
        isKitchenTask: true,
        status: 'ISSUE',
        scheduledStart: new Date(Date.now() - 1000 * 60 * 60 * 24),
        scheduledEnd: new Date(Date.now() - 1000 * 60 * 60 * 20),
        actualStart: new Date(Date.now() - 1000 * 60 * 60 * 24),
        assignedAssemblerIds: ['a3'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        estimatedDurationMinutes: 240,
        history: [
            { id: 'e3', taskId: 't3', type: 'ISSUE_REPORTED', eventTime: new Date(Date.now() - 1000 * 60 * 60 * 23), location: { lat: -36.7800, lng: 174.7700, address: 'Issue Location' }, metadata: { reason: 'Sink basin incompatible with cabinet cutout — need replacement part' } }
        ]
    },
    {
        id: 't4',
        orderId: 'o4',
        requiredSkills: ['CABINETRY', 'COUNTERTOP'],
        taskType: 'COUNTERTOP_INSTALL',
        isKitchenTask: true,
        status: 'CREATED',
        scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 24),
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 26),
        assignedAssemblerIds: [],
        createdAt: new Date(),
        estimatedDurationMinutes: 150,
        history: []
    },
    {
        id: 't5',
        orderId: 'o5',
        requiredSkills: ['CABINETRY', 'PLUMBING', 'COUNTERTOP'],
        taskType: 'CABINET_INSTALL',
        isKitchenTask: true,
        status: 'ASSIGNED',
        scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 3),
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 11),
        assignedAssemblerIds: ['a7', 'a8'],
        createdAt: new Date(),
        estimatedDurationMinutes: 480,
        history: [
            { id: 'e5', taskId: 't5', type: 'ASSIGNED', eventTime: new Date(Date.now() - 1800000), location: { lat: -36.7650, lng: 174.7550, address: 'Takapuna' }, metadata: { assemblerId: 'a7,a8' } }
        ]
    },
    {
        id: 't6',
        orderId: 'o6',
        requiredSkills: ['CABINETRY', 'ELECTRICAL'],
        taskType: 'ELECTRICAL_INSTALL',
        isKitchenTask: true,
        status: 'EN_ROUTE',
        scheduledStart: new Date(Date.now() + 1000 * 60 * 30),
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 390),
        assignedAssemblerIds: ['a10'],
        createdAt: new Date(),
        estimatedDurationMinutes: 360,
        history: [
            { id: 'e6', taskId: 't6', type: 'ASSIGNED', eventTime: new Date(Date.now() - 3000000), location: { lat: -36.8100, lng: 174.7400, address: 'Herne Bay' }, metadata: { assemblerId: 'a10' } },
            { id: 'e7', taskId: 't6', type: 'EN_ROUTE', eventTime: new Date(Date.now() - 900000), location: { lat: -36.8200, lng: 174.7450, address: 'En route' }, metadata: {} }
        ]
    },
    {
        id: 't7',
        orderId: 'o7',
        requiredSkills: ['CABINETRY', 'MEASURING'],
        taskType: 'CABINET_INSTALL',
        isKitchenTask: true,
        status: 'COMPLETED',
        scheduledStart: new Date(Date.now() - 1000 * 60 * 60 * 9),
        scheduledEnd: new Date(Date.now() - 1000 * 60 * 60 * 1),
        actualStart: new Date(Date.now() - 1000 * 60 * 60 * 9),
        actualEnd: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
        assignedAssemblerIds: ['a5'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        estimatedDurationMinutes: 480,
        history: [
            { id: 'e8', taskId: 't7', type: 'ASSIGNED', eventTime: new Date(Date.now() - 1000 * 60 * 60 * 6), location: { lat: -36.9000, lng: 174.8000, address: 'Ellerslie' }, metadata: { assemblerId: 'a5' } },
            { id: 'e9', taskId: 't7', type: 'STARTED', eventTime: new Date(Date.now() - 1000 * 60 * 60 * 5), location: { lat: -36.8700, lng: 174.7780, address: 'Newmarket' }, metadata: {} },
            { id: 'e10', taskId: 't7', type: 'COMPLETED', eventTime: new Date(Date.now() - 1000 * 60 * 60 * 3.5), location: { lat: -36.8700, lng: 174.7780, address: 'Newmarket' }, metadata: {} }
        ]
    },
    {
        id: 't8',
        orderId: 'o8',
        requiredSkills: ['CABINETRY', 'COUNTERTOP'],
        taskType: 'COUNTERTOP_INSTALL',
        isKitchenTask: true,
        status: 'CREATED',
        scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 48),
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 55),
        assignedAssemblerIds: [],
        createdAt: new Date(),
        estimatedDurationMinutes: 420,
        history: []
    },
    {
        id: 't9',
        orderId: 'o9',
        requiredSkills: ['CABINETRY', 'PLUMBING'],
        taskType: 'CABINET_INSTALL',
        isKitchenTask: true,
        status: 'ASSIGNED',
        scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 6),
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 12),
        assignedAssemblerIds: ['a4'],
        createdAt: new Date(),
        estimatedDurationMinutes: 360,
        history: [
            { id: 'e11', taskId: 't9', type: 'ASSIGNED', eventTime: new Date(Date.now() - 1200000), location: { lat: -36.8600, lng: 174.7800, address: 'Remuera' }, metadata: { assemblerId: 'a4' } }
        ]
    },
    {
        id: 't10',
        orderId: 'o10',
        requiredSkills: ['CABINETRY', 'PLUMBING', 'ELECTRICAL', 'COUNTERTOP'],
        taskType: 'CABINET_INSTALL',
        isKitchenTask: true,
        status: 'CREATED',
        scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 72),
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 74),
        assignedAssemblerIds: [],
        createdAt: new Date(),
        estimatedDurationMinutes: 120,
        history: []
    }
];
