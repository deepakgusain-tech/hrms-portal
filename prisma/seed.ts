import "dotenv/config";
import bcrypt from "bcrypt";
import {
  ExperienceType,
  MovementType,
  Status,
} from "../app/generated/prisma";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding started...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const employeePassword = await bcrypt.hash("employee123", 10);
  const employerPassword = await bcrypt.hash("employer123", 10);

  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      remark: "System Administrator",
      status: Status.ACTIVE,
    },
  });

  const hrRole = await prisma.role.upsert({
    where: { name: "HR" },
    update: {},
    create: {
      name: "HR",
      remark: "Human Resource Manager",
      status: Status.ACTIVE,
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: "Employee" },
    update: {},
    create: {
      name: "Employee",
      remark: "Normal Employee",
      status: Status.ACTIVE,
    },
  });

  // Modules
  const modules = [
    { name: "Dashboard", description: "Dashboard Module", route: "/dashboard" },
    { name: "Users", description: "Users Module", route: "/users" },
    { name: "Employees", description: "Employee Module", route: "/employees" },
    { name: "Companies", description: "Company Module", route: "/companies" },
    { name: "Employers", description: "Employer Module", route: "/employers" },
    { name: "Departments", description: "Department Module", route: "/departments" },
    { name: "Job Roles", description: "Job Roles Module", route: "/job-roles" },
    { name: "Locations", description: "Work Locations Module", route: "/locations" },
  ];

  const createdModules = [];

  for (const mod of modules) {
    const createdModule = await prisma.module.upsert({
      where: { route: mod.route },
      update: {},
      create: {
        ...mod,
        status: Status.ACTIVE,
      },
    });

    createdModules.push(createdModule);
  }

  for (const mod of createdModules) {
    await prisma.roleModule.upsert({
      where: {
        roleId_moduleId: {
          roleId: adminRole.id,
          moduleId: mod.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        moduleId: mod.id,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      },
    });

    await prisma.roleModule.upsert({
      where: {
        roleId_moduleId: {
          roleId: hrRole.id,
          moduleId: mod.id,
        },
      },
      update: {},
      create: {
        roleId: hrRole.id,
        moduleId: mod.id,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
      },
    });
  }

  // Users
  await prisma.user.upsert({
    where: { email: "admin@hrms.com" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      firstName: "Super",
      lastName: "Admin",
      email: "admin@hrms.com",
      roleId: adminRole.id,
      status: Status.ACTIVE,
    },
  });

  const employeeUser = await prisma.user.upsert({
    where: { email: "employee@hrms.com" },
    update: {},
    create: {
      username: "employee1",
      password: employeePassword,
      firstName: "Rahul",
      lastName: "Sharma",
      email: "employee@hrms.com",
      roleId: employeeRole.id,
      status: Status.ACTIVE,
    },
  });

  // Departments
  const itDept = await prisma.department.upsert({
    where: { code: "IT001" },
    update: {},
    create: {
      name: "IT",
      code: "IT001",
      description: "Information Technology",
      status: Status.ACTIVE,
    },
  });

  await prisma.department.upsert({
    where: { code: "HR001" },
    update: {},
    create: {
      name: "HR",
      code: "HR001",
      description: "Human Resources",
      status: Status.ACTIVE,
    },
  });

  // Job Roles
  const developer = await prisma.jobRole.upsert({
    where: { code: "DEV001" },
    update: {},
    create: {
      name: "Software Developer",
      code: "DEV001",
      description: "Develops software systems",
      status: Status.ACTIVE,
    },
  });

  await prisma.jobRole.upsert({
    where: { code: "MGR001" },
    update: {},
    create: {
      name: "HR Manager",
      code: "MGR001",
      description: "Handles HR operations",
      status: Status.ACTIVE,
    },
  });

  // Locations
  const delhiOffice = await prisma.workLocation.upsert({
    where: { code: "DEL001" },
    update: {},
    create: {
      name: "Delhi Office",
      code: "DEL001",
      address: "Connaught Place",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      postalCode: "110001",
      status: Status.ACTIVE,
    },
  });

  const noidaOffice = await prisma.workLocation.upsert({
    where: { code: "NOI001" },
    update: {},
    create: {
      name: "Noida Office",
      code: "NOI001",
      address: "Sector 62",
      city: "Noida",
      state: "Uttar Pradesh",
      country: "India",
      postalCode: "201309",
      status: Status.ACTIVE,
    },
  });

  // Company (Create before EmployeeProfile)
  const company = await prisma.company.upsert({
    where: { companyCode: "CMP001" },
    update: {},
    create: {
      companyName: "SY Associates",
      companyCode: "CMP001",
      email: "contact@syassociates.com",
      phone: "9810012345",
      website: "https://syassociates.com",
      address: "Noida, Uttar Pradesh, India",
      status: Status.ACTIVE,
    },
  });

  // Employee Profile
  const employeeProfile = await prisma.employeeProfile.upsert({
    where: { employeeCode: "EMP001" },
    update: {},
    create: {
      employeeId: employeeUser.id,
      employeeName: "Rahul Sharma",
      employeeCode: "EMP001",

      companyId: company.id,

      phone: "9876543210",
      alternatePhone: "9876500000",
      gender: "Male",
      joiningDate: new Date(),

      departmentId: itDept.id,
      jobRoleId: developer.id,
      workLocationId: delhiOffice.id,

      address: "Delhi, India",
      emergencyContactName: "Ramesh Sharma",
      emergencyContactPhone: "9999999999",

      status: Status.ACTIVE,
    },
  });

  // Employee Documents
  const existingDoc = await prisma.employeeDocument.findFirst({
    where: {
      employeeId: employeeProfile.id,
    },
  });

  if (!existingDoc) {
    await prisma.employeeDocument.create({
      data: {
        employeeId: employeeProfile.id,
        employeeCode: employeeProfile.employeeCode,
        aadhaarNumber: "123412341234",
        panNumber: "ABCDE1234F",
        aadhaarFileUrl: "/uploads/aadhaar.pdf",
        panFileUrl: "/uploads/pan.pdf",
        educationEntries: [
          {
            degree: "B.Tech",
            institute: "Delhi University",
            year: "2024",
            percentage: "78%",
          },
        ],
        experienceType: ExperienceType.FRESHER,
        experienceEntries: [],
        status: Status.ACTIVE,
      },
    });
  }

  // Transfer / Promotion
  const existingTransfer = await prisma.transferPromotion.findFirst({
    where: {
      employeeId: employeeProfile.id,
      movementType: MovementType.TRANSFER,
    },
  });

  if (!existingTransfer) {
    await prisma.transferPromotion.create({
      data: {
        employeeId: employeeProfile.id,
        movementType: MovementType.TRANSFER,
        fromLocationId: delhiOffice.id,
        toLocationId: noidaOffice.id,
        effectiveDate: new Date(),
        reason: "Project Requirement",
        currentDesignation: "Software Developer",
        newDesignation: "Senior Software Developer",
        status: Status.ACTIVE,
      },
    });
  }

  // Employer
  await prisma.employer.upsert({
    where: { email: "employer@hrms.com" },
    update: {},
    create: {
      companyId: company.id,
      employerName: "Amit Verma",
      employerCode: "EMPR001",
      email: "employer@hrms.com",
      phone: "9898989898",
      password: employerPassword,
      designation: "Hiring Manager",
      address: "Noida, Uttar Pradesh, India",
      status: Status.ACTIVE,
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });