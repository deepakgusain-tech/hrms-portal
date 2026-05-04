import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { prisma } from '@/lib/prisma';
import React from 'react'

const EmployeeProfileDetail = async ({ params }: {
    params: Promise<{ id: string }>
}) => {

    const { id } = await params;

    const employeeProfile = await prisma.employeeProfile.findUnique({
        where: { employeeCode: id },
        include: {
            department: true,
            jobRole: true,
            workLocation: true,
            company: true,
        }
    });
    
    return (
        <Card>
            <CardHeader>
                <h1 className='text-xl'>Employee Code - <span className='font-bold'>{id}</span> </h1>
            </CardHeader>
            <CardContent>
                <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Employee Name</div>
                            <div>{employeeProfile?.employeeName || "-"}</div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Company</div>
                            <div>{employeeProfile?.company?.companyName || "-"}</div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Department</div>
                            <div>{employeeProfile?.department?.name || "-"}</div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Job Role</div>
                            <div>{employeeProfile?.jobRole?.name || "-"}</div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Work Location</div>
                            <div>{employeeProfile?.workLocation?.name || "-"}</div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Email</div>
                            <div>{employeeProfile?.email || "-"}</div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Gender</div>
                            <div>{employeeProfile?.gender || "-"}</div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Phone</div>
                            <div>{employeeProfile?.phone || "-"}</div>
                        </CardHeader>
                    </Card>


                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Alternate Phone</div>
                            <div>{employeeProfile?.alternatePhone || "-"}</div>
                        </CardHeader>
                    </Card>


                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Joining Date</div>
                            <div> {employeeProfile?.joiningDate
                                ? new Date(employeeProfile.joiningDate).toLocaleDateString()
                                : "-"}</div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Emergency Contact Name</div>
                            <div>{employeeProfile?.emergencyContactName || "-"}</div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Emergency Contact Number</div>
                            <div>{employeeProfile?.emergencyContactPhone || "-"}</div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Date Of Birth</div>
                            <div>
                                {employeeProfile?.dateOfBirth
                                    ? new Date(employeeProfile.dateOfBirth).toLocaleDateString()
                                    : "-"}
                            </div>
                        </CardHeader>
                    </Card>


                    <Card>
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Status</div>
                            <div>{employeeProfile?.status || "-"}</div>
                        </CardHeader>
                    </Card>


                    <Card className="col-span-5">
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Address</div>
                            <div>{employeeProfile?.address || "-"}</div>
                        </CardHeader>
                    </Card>

                    <Card className="col-span-5">
                        <CardHeader>
                            <div className='font-medium text-gray-500'>Remark</div>
                            <div>{employeeProfile?.remark || "-"}</div>
                        </CardHeader>
                    </Card>

                </div>
            </CardContent>
        </Card>
    )
}

export default EmployeeProfileDetail