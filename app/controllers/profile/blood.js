const { assign, isString, isEmpty } = require('lodash')
const { Op } = require('@sequelize/core')
/**
 * Internal dependencies
 */
const BloodFoundationDTO = require('@/app/dtos/blood-foundation')
const BloodDonorDTO = require('@/app/dtos/blood-donor')
const BloodFoundationDonorDTO = require('@/app/dtos/blood-foundation-donor')
const BloodRequestDTO = require('@/app/dtos/blood-request')
const BloodFoundationRepository = require('@/app/repositories/blood-foundation')
const UserRepository = require('@/app/repositories/user')
const BloodDonorRepository = require('@/app/repositories/blood-donor')
const BloodFoundationDonorRepository = require('@/app/repositories/blood-foundation-donor')
const BloodRequestRepository = require('@/app/repositories/blood-request')
const HospitalRepository = require('@/app/repositories/hospital')
const DiagnosticRepository = require('@/app/repositories/diagnostic')
const NotificationRepository = require('@/app/repositories/notification')
const Controller = require('@/app/controllers/controller')
const UserRoleRepository = require('@/app/repositories/user-role')
const UserRoleDTO = require('@/app/dtos/user-role')

const {
    getFileUrl,
    getFileFromPath,
    isPastDate,
    isRoleHigher,
} = require('@/app/helpers')
const {
    PLACEHOLDER_IMAGE,
    PLACEHOLDER_AVATAR,
    ROLES,
} = require('@/app/helpers/constants')
const profile = require('@/routes/v1/profile')

class BloodController {
    static async createDonor(request, reply) {
        const { id } = request.user

        try {
            const donorRepository = new BloodDonorRepository()
            const isExists = await donorRepository.isExists(id)

            if (isExists) {
                throw new Error('You are already a donor')
            }

            const donorDTO = new BloodDonorDTO()
            assign(donorDTO, {
                ...request.body,
                userId: id,
            })

            await donorRepository.create(donorDTO)
            await donorRepository.socketCreateDonor(request.user, this.io)

            reply.send({
                message: 'Donor created successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getDonorDetails(request, reply) {
        const { id } = request.user

        try {
            const donorRepository = new BloodDonorRepository()
            const donor = await donorRepository.findOne({
                where: { userId: id },
                attributes: { exclude: ['userId', 'user_id'] },
            })

            if (!donor) {
                throw new Error('Donor not found')
            }

            reply.send({
                message: 'Donor fetched successfully',
                data: donor,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateDonorDetails(request, reply) {
        const { id } = request.user

        try {
            const donorRepository = new BloodDonorRepository()
            const user = await donorRepository.findOne({
                where: { userId: id },
            })

            if (isEmpty(user)) {
                throw new Error('You are not a donor')
            }

            const donorDTO = new BloodDonorDTO()
            assign(donorDTO, {
                ...user.dataValues,
                ...request.body,
            })

            await donorRepository.update(donorDTO, {
                where: { userId: id },
            })

            await donorRepository.socketUpdateDonor(request.user, this.io)

            reply.send({
                message: 'Donor updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteDonor(request, reply) {
        const { id } = request.user

        try {
            const donorRepository = new BloodDonorRepository()

            const isExists = await donorRepository.isExists(id)
            if (!isExists) {
                throw new Error('You are not a donor')
            }

            await donorRepository.socketDeleteDonor(request.user, this.io)
            await donorRepository.destroy({
                where: { userId: id },
            })

            reply.send({
                message: 'Donor deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async createBloodRequest(request, reply) {
        const { id: userId, district } = request.user

        try {
            const bloodRequestRepo = new BloodRequestRepository()
            const hospitalRepo = new HospitalRepository()
            const diagnosticRepo = new DiagnosticRepository()
            const bloodRequestDTO = new BloodRequestDTO()
            const notificationRepo = new NotificationRepository()

            if ('hospital' === request.body.locationType) {
                const isExists = await hospitalRepo.isExists(
                    request.body.location
                )
                if (!isExists) {
                    throw new Error('Hospital not found')
                }
            }

            if ('diagnostic' === request.body.locationType) {
                const isExists = await diagnosticRepo.isExists(
                    request.body.location
                )
                if (!isExists) {
                    throw new Error('Diagnostic center not found')
                }
            }

            assign(bloodRequestDTO, {
                ...request.body,
                userId,
                district,
            })

            const response = await bloodRequestRepo.create(bloodRequestDTO)
            await bloodRequestRepo.socketCreateRequest({
                user: request.user,
                requestId: response.id,
                socket: this.io,
            })

            const notificationData = await bloodRequestRepo.getNotificationData(
                {
                    user: request.user,
                    requestId: response.id,
                }
            )

            if (!notificationData.payload) {
                throw new Error('Request not found or expired')
            }

            notificationRepo.sendBloodRequestNotification({
                receivers: notificationData.receivers,
                payload: notificationData.payload,
                user: request.user,
                socket: this.io,
            })

            reply.send({
                message: 'Created successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getBloodRequestList(request, reply) {
        const { id: userId } = request.user

        try {
            const bloodRequestRepo = new BloodRequestRepository()
            const hospitalRepo = new HospitalRepository()
            const diagnosticRepo = new DiagnosticRepository()

            const requestTableWhere = {
                userId,
            }

            if (request.query.bloodGroup) {
                requestTableWhere.bloodGroup = request.query.bloodGroup
            }

            const bloodRequests = await bloodRequestRepo.findAll({
                where: requestTableWhere,
                order: [['createdAt', 'DESC']],
            })

            const hospitalIds = []
            const diagnosticIds = []

            bloodRequests.forEach((item) => {
                if (item.locationType === 'hospital') {
                    hospitalIds.push(item.location)
                } else if (item.locationType === 'diagnostic') {
                    diagnosticIds.push(item.location)
                }
            })

            const hospitals = await hospitalRepo.findAll({
                where: {
                    id: { [Op.in]: hospitalIds },
                },
            })

            const diagnostics = await diagnosticRepo.findAll({
                where: {
                    id: { [Op.in]: diagnosticIds },
                },
            })

            // attach additional data to each blood request
            bloodRequests.forEach((request) => {
                if (request.locationType === 'hospital') {
                    const hospital = hospitals.find(
                        (h) => h.id === request.location
                    )
                    if (hospital) {
                        request.setDataValue('locationDetails', {
                            name: hospital.name,
                            address: hospital.address,
                            googleMapUrl: hospital.googleMapUrl,
                            upazila: hospital.upazila,
                            union: hospital.union,
                            district: hospital.district,
                            isMunicipality: hospital.isMunicipality,
                            municipality: hospital.municipality,
                        })
                    }
                } else if (request.locationType === 'diagnostic') {
                    const diagnostic = diagnostics.find(
                        (d) => d.id === request.location
                    )
                    if (diagnostic) {
                        request.setDataValue('locationDetails', {
                            name: diagnostic.name,
                            address: diagnostic.address,
                            googleMapUrl: diagnostic.googleMapUrl,
                            upazila: diagnostic.upazila,
                            union: diagnostic.union,
                            district: diagnostic.district,
                            isMunicipality: diagnostic.isMunicipality,
                            municipality: diagnostic.municipality,
                        })
                    }
                }

                request.setDataValue('isExpired', isPastDate(request.date))
            })

            reply.send({
                message: 'Fetched successfully',
                data: bloodRequests,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getBloodRequestDetails(request, reply) {
        const { id: userId } = request.user
        const { id } = request.params

        try {
            const requestRepo = new BloodRequestRepository()
            const bloodRequest = await requestRepo.findOne({
                where: {
                    userId,
                    id,
                },
            })

            if (!bloodRequest) {
                throw new Error('Blood request not found')
            }

            reply.send({
                message: 'Fetched successfully',
                data: bloodRequest,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateBloodRequest(request, reply) {
        const { id: userId } = request.user
        const { id } = request.params

        try {
            const bloodRequestRepo = new BloodRequestRepository()
            const bloodRequestDTO = new BloodRequestDTO()
            const hospitalRepo = new HospitalRepository()
            const diagnosticRepo = new DiagnosticRepository()
            const notificationRepo = new NotificationRepository()

            const bloodRequest = await bloodRequestRepo.findOne({
                where: {
                    userId,
                    id,
                },
            })

            if (!bloodRequest) {
                throw new Error('Blood request not found')
            }

            if ('hospital' === request.body.locationType) {
                const isExists = await hospitalRepo.isExists(
                    request.body.location
                )
                if (!isExists) {
                    throw new Error('Hospital not found')
                }
            }

            if ('diagnostic' === request.body.locationType) {
                const isExists = await diagnosticRepo.isExists(
                    request.body.location
                )
                if (!isExists) {
                    throw new Error('Diagnostic center not found')
                }
            }

            assign(bloodRequestDTO, {
                ...bloodRequest.dataValues,
                ...request.body,
            })

            await bloodRequestRepo.update(bloodRequestDTO, {
                where: { id, userId },
            })

            await bloodRequestRepo.socketUpdateRequest({
                user: request.user,
                requestId: id,
                socket: this.io,
            })

            const notificationData = await bloodRequestRepo.getNotificationData(
                {
                    user: request.user,
                    requestId: id,
                }
            )

            notificationRepo.sendBloodRequestNotification({
                receivers: notificationData.receivers,
                payload: notificationData.payload,
                user: request.user,
                socket: this.io,
            })

            reply.send({
                message: 'Updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteBloodRequest(request, reply) {
        const { id: userId } = request.user
        const { id } = request.params

        try {
            const bloodRequest = new BloodRequestRepository()
            const existingRequest = await bloodRequest.findOne({
                where: {
                    userId,
                    id,
                },
            })

            if (!existingRequest) {
                throw new Error('Blood request not found')
            }

            await bloodRequest.socketDeleteRequest({
                user: request.user,
                requestId: id,
                socket: this.io,
            })

            await bloodRequest.destroy({
                where: {
                    userId,
                    id,
                },
            })

            reply.send({
                message: 'Deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getAllFoundations(request, reply) {
        const { id: userId } = request.user

        try {
            const foundationRepository = new BloodFoundationRepository()
            const userRoleRepo = new UserRoleRepository()
            const userRoles = await userRoleRepo.findAll({
                where: {
                    userId,
                    organizationType: 'blood_foundation',
                    status: 'active',
                },
            })

            const organizationIds = userRoles.map((role) => role.organizationId)
            const foundations = await foundationRepository.findAll({
                where: {
                    [Op.or]: [{ userId }, { id: { [Op.in]: organizationIds } }],
                },
                order: [['createdAt', 'DESC']],
            })

            foundations.forEach((foundation) => {
                foundation.setDataValue(
                    'thumbnailUrl',
                    getFileUrl(foundation.thumbnailUrl || PLACEHOLDER_IMAGE)
                )

                if (isString(foundation.mobiles)) {
                    foundation.setDataValue(
                        'mobiles',
                        JSON.parse(foundation.mobiles || '[]')
                    )
                }

                if (isString(foundation.socials)) {
                    foundation.setDataValue(
                        'socials',
                        JSON.parse(foundation.socials || '[]')
                    )
                }
            })

            reply.send({
                message: 'Successful',
                data: foundations,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getFoundationDetails(request, reply) {
        const { id } = request.params
        const { id: userId } = request.user

        try {
            if (!id) {
                throw new Error('Foundation id is required')
            }

            const foundationRepository = new BloodFoundationRepository()
            const userRoleRepo = new UserRoleRepository()
            const userRole = await userRoleRepo.findOne({
                where: {
                    userId,
                    organizationId: id,
                    organizationType: 'blood_foundation',
                    status: 'active',
                },
            })

            const foundationTableWhere = {}

            if (userRole) {
                foundationTableWhere.id = id
            } else {
                foundationTableWhere.userId = userId
                foundationTableWhere.id = id
            }

            const foundation = await foundationRepository.findOne({
                where: foundationTableWhere,
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            foundation.setDataValue(
                'thumbnailUrl',
                getFileUrl(foundation.thumbnailUrl || PLACEHOLDER_IMAGE)
            )

            if (isString(foundation.mobiles)) {
                foundation.setDataValue(
                    'mobiles',
                    JSON.parse(foundation.mobiles || '[]')
                )
            }

            if (isString(foundation.socials)) {
                foundation.setDataValue(
                    'socials',
                    JSON.parse(foundation.socials || '[]')
                )
            }

            reply.send({
                message: 'Foundation details',
                data: foundation,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateFoundationDetails(request, reply) {
        const { id: foundationId } = request.params
        const { id: userId } = request.user

        try {
            if (!foundationId) {
                throw new Error('Foundation id is required')
            }

            const foundationRepository = new BloodFoundationRepository()
            const userRoleRepo = new UserRoleRepository()
            const userRole = await userRoleRepo.findOne({
                where: {
                    userId,
                    organizationId: foundationId,
                    organizationType: 'blood_foundation',
                    status: 'active',
                },
            })

            const foundationTableWhere = {}

            if (userRole) {
                foundationTableWhere.id = foundationId
            } else {
                foundationTableWhere.userId = userId
                foundationTableWhere.id = foundationId
            }

            const foundation = await foundationRepository.findOne({
                where: foundationTableWhere,
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            if (request.body.thumbnailFile) {
                request.body.thumbnailUrl = getFileFromPath(
                    request.body.thumbnailFile
                )
            }

            const foundationDTO = new BloodFoundationDTO()
            assign(foundationDTO, {
                id: foundationId,
                ...request.body,
                thumbnailUrl: getFileFromPath(
                    request.body.thumbnailUrl || foundation.thumbnailUrl
                ),
            })

            if (request.body.isMunicipality) {
                foundationDTO.isMunicipality = true
                foundationDTO.municipality = request.body.municipality || null
                foundationDTO.union = null
            } else {
                foundationDTO.isMunicipality = false
                foundationDTO.union = request.body.union || null
                foundationDTO.municipality = null
            }

            await foundationRepository.update(foundationDTO, {
                where: { id: foundationId },
            })

            reply.send({
                message: 'Foundation updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteFoundation(request, reply) {
        const { id } = request.params
        const { id: userId } = request.user

        try {
            if (!id) {
                throw new Error('Foundation id is required')
            }

            const foundationRepository = new BloodFoundationRepository()
            const userRoleRepo = new UserRoleRepository()
            const userRole = await userRoleRepo.findOne({
                where: {
                    userId,
                    organizationId: id,
                    organizationType: 'blood_foundation',
                    status: 'active',
                    role: {
                        [Op.in]: [ROLES.OWNER, ROLES.ADMIN],
                    },
                },
            })

            const foundationTableWhere = {}

            if (userRole) {
                foundationTableWhere.id = id
            } else {
                foundationTableWhere.userId = userId
                foundationTableWhere.id = id
            }

            const foundation = await foundationRepository.findOne({
                where: foundationTableWhere,
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            await foundationRepository.destroy({
                where: { id },
            })

            reply.send({
                message: 'Foundation deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async createFoundation(request, reply) {
        const { district, id } = request.user
        const { isMunicipality, municipality, union } = request.body

        try {
            const foundationRepository = new BloodFoundationRepository()
            const foundationDTO = new BloodFoundationDTO()
            const userRepository = new UserRepository()

            // check if the user exists
            const user = await userRepository.findOne({
                where: { id },
            })

            if (!user || !user.isVerified || !user.isOnboarded) {
                throw new Error('User not found')
            }

            assign(foundationDTO, {
                ...request.body,
                userId: id,
                district,
                thumbnailUrl: getFileFromPath(request.body.thumbnailUrl),
            })

            if (isMunicipality) {
                foundationDTO.municipality = municipality
                foundationDTO.union = null
            } else {
                foundationDTO.union = union
                foundationDTO.municipality = null
            }

            const foundation = await foundationRepository.create(foundationDTO)

            foundation.setDataValue(
                'thumbnailUrl',
                getFileUrl(foundation.thumbnailUrl || PLACEHOLDER_IMAGE)
            )

            return {
                message: 'Foundation created successfully',
                data: foundation,
            }
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async addFoundationDonor(request, reply) {
        const { id } = request.params
        const { id: userId } = request.user

        try {
            const donorDTO = new BloodFoundationDonorDTO()
            const foundationDTO = new BloodFoundationDTO()
            const donorRepository = new BloodFoundationDonorRepository()
            const foundationRepository = new BloodFoundationRepository()
            const userRoleRepo = new UserRoleRepository()
            const userRole = await userRoleRepo.findOne({
                where: {
                    userId,
                    organizationId: id,
                    organizationType: 'blood_foundation',
                    status: 'active',
                    role: {
                        [Op.in]: [ROLES.OWNER, ROLES.ADMIN],
                    },
                },
            })

            const foundationTableWhere = {}

            if (userRole) {
                foundationTableWhere.id = id
            } else {
                foundationTableWhere.userId = userId
                foundationTableWhere.id = id
            }

            const foundation = await foundationRepository.findOne({
                where: foundationTableWhere,
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            const donorExists = await donorRepository.findOne({
                where: { mobile: request.body.mobile, foundationId: id },
            })

            if (donorExists) {
                throw new Error('Donor already exists')
            }

            assign(donorDTO, {
                ...request.body,
                foundationId: id,
                profilePictureUrl: getFileFromPath(
                    request.body.profilePictureUrl
                ),
            })

            await donorRepository.create(donorDTO)

            assign(foundationDTO, {
                name: foundation.name,
            })

            await foundationRepository.update(foundationDTO, {
                where: { id },
            })

            reply.send({
                message: 'Created successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateFoundationDonor(request, reply) {
        const { foundationId, donorId } = request.params
        const { id: userId } = request.user

        try {
            const donorDTO = new BloodFoundationDonorDTO()
            const foundationDTO = new BloodFoundationDTO()
            const donorRepository = new BloodFoundationDonorRepository()
            const foundationRepository = new BloodFoundationRepository()
            const userRoleRepo = new UserRoleRepository()
            const userRole = await userRoleRepo.findOne({
                where: {
                    userId,
                    organizationId: foundationId,
                    organizationType: 'blood_foundation',
                    status: 'active',
                },
            })

            const foundationTableWhere = {}

            if (userRole) {
                foundationTableWhere.id = foundationId
            } else {
                foundationTableWhere.userId = userId
                foundationTableWhere.id = foundationId
            }

            const foundation = await foundationRepository.findOne({
                where: foundationTableWhere,
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            const donor = await donorRepository.findOne({
                where: { id: donorId, foundationId },
            })

            if (!donor) {
                throw new Error('Donor not found')
            }

            if (request.body.mobile) {
                const donorExists = await donorRepository.findOne({
                    where: {
                        mobile: request.body.mobile,
                        foundationId,
                        id: { [Op.ne]: donorId }, // exclude current donor
                    },
                })

                if (donorExists) {
                    throw new Error(
                        'Donor with this mobile number already exists'
                    )
                }
            }

            assign(donorDTO, {
                ...request.body,
                id: donorId,
                foundationId,
                profilePictureUrl: getFileFromPath(
                    request.body.profilePictureUrl || donor.profilePictureUrl
                ),
            })

            await donorRepository.update(donorDTO, {
                where: { id: donorId, foundationId },
            })

            assign(foundationDTO, {
                name: foundation.name,
            })

            await foundationRepository.update(foundationDTO, {
                where: { id: foundationId },
            })

            reply.send({
                message: 'Donor updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteFoundationDonor(request, reply) {
        const { foundationId, donorId } = request.params
        const { id: userId } = request.user

        try {
            const foundationDTO = new BloodFoundationDTO()
            const donorRepository = new BloodFoundationDonorRepository()
            const foundationRepository = new BloodFoundationRepository()
            const userRoleRepo = new UserRoleRepository()

            const userRole = await userRoleRepo.findOne({
                where: {
                    userId,
                    organizationId: foundationId,
                    organizationType: 'blood_foundation',
                    status: 'active',
                    role: {
                        [Op.in]: [ROLES.OWNER, ROLES.ADMIN],
                    },
                },
            })

            const foundationTableWhere = {}

            if (userRole) {
                foundationTableWhere.id = foundationId
            } else {
                foundationTableWhere.userId = userId
                foundationTableWhere.id = foundationId
            }

            const foundation = await foundationRepository.findOne({
                where: foundationTableWhere,
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            const donor = await donorRepository.findOne({
                where: { id: donorId, foundationId },
            })

            if (!donor) {
                throw new Error('Donor not found')
            }

            await donorRepository.destroy({
                where: { id: donorId, foundationId },
            })

            assign(foundationDTO, {
                name: foundation.name,
            })

            await foundationRepository.update(foundationDTO, {
                where: { id: foundationId },
            })

            reply.send({
                message: 'Donor deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getFoundationDonorList(request, reply) {
        const { id: userId } = request.user
        const { foundationId } = request.params

        try {
            const donorRepository = new BloodFoundationDonorRepository()
            const foundationRepository = new BloodFoundationRepository()
            const userRoleRepo = new UserRoleRepository()

            const userRole = await userRoleRepo.findOne({
                where: {
                    userId,
                    organizationId: foundationId,
                    organizationType: 'blood_foundation',
                    status: 'active',
                },
            })

            const foundationTableWhere = {}

            if (userRole) {
                foundationTableWhere.id = foundationId
            } else {
                foundationTableWhere.userId = userId
                foundationTableWhere.id = foundationId
            }

            const foundation = await foundationRepository.findOne({
                where: foundationTableWhere,
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            const where = {
                foundationId,
            }

            if (request.query.bloodGroup) {
                where.bloodGroup = request.query.bloodGroup
            }

            if (request.query.upazila) {
                where.upazila = request.query.upazila
            }

            if (request.query.gender) {
                where.gender = request.query.gender
            }

            const searchTerm = request.query.search || ''
            if (searchTerm) {
                where[Op.or] = [
                    { name: { [Op.like]: `%${searchTerm}%` } },
                    { description: { [Op.like]: `%${searchTerm}%` } },
                ]
            }

            const donors = await donorRepository.findAll({
                where,
                order: [['updatedAt', 'DESC']],
            })

            donors.forEach((donor) => {
                donor.setDataValue(
                    'profilePictureUrl',
                    getFileUrl(donor.profilePictureUrl || PLACEHOLDER_AVATAR)
                )
            })

            reply.send({
                message: 'Donors fetched successfully',
                data: donors,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async shareFoundationAccess(request, reply) {
        const { id: currentUserId } = request.user
        const { userId, role, foundationId } = request.body

        try {
            const roleRepo = new UserRoleRepository()
            const foundationRepo = new BloodFoundationRepository()
            const userRepository = new UserRepository()
            const userRoleDTO = new UserRoleDTO()
            const notificationRepo = new NotificationRepository()

            const currentUserRole = await foundationRepo.getUserRoleStatus({
                userId: currentUserId,
                foundationId,
            })

            if (
                !currentUserRole ||
                'active' !== currentUserRole.status ||
                ![ROLES.OWNER, ROLES.ADMIN].includes(currentUserRole.role)
            ) {
                throw new Error('Unauthorized action')
            }

            if (isRoleHigher(role, currentUserRole.role)) {
                throw new Error('Not allowed to share higher role access')
            }

            const alreadyExists = await roleRepo.findOne({
                where: {
                    userId,
                    organizationId: foundationId,
                },
            })

            if (alreadyExists) {
                if (['pending', 'rejected'].includes(alreadyExists.status)) {
                    // delete the existing role
                    await roleRepo.destroy({
                        where: {
                            userId,
                            organizationId: foundationId,
                        },
                    })
                } else {
                    throw new Error(
                        'User already has access to this foundation'
                    )
                }
            }

            // Check if the foundation exists
            const foundation = await foundationRepo.findOne({
                where: {
                    id: foundationId,
                    userId: currentUserId,
                },
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            // Check if the user exists
            const user = await userRepository.findOne({
                where: {
                    id: userId,
                },
            })

            if (!user) {
                throw new Error('User not found')
            }

            const currentUserData = await userRepository.findOne({
                where: {
                    id: currentUserId,
                },
            })

            assign(userRoleDTO, {
                userId,
                createdBy: currentUserId,
                organizationId: foundationId,
                organizationType: 'blood_foundation',
                role,
                status: 'pending',
            })

            const response = await roleRepo.create(userRoleDTO)
            await roleRepo.socketUpdateUserRole({
                userRoleId: response.id,
                socket: this.io,
            })

            notificationRepo.sendAccessInvitationNotification({
                receivers: [userId],
                payload: {
                    role,
                    organizationName: foundation.name,
                    accessId: response.id,
                },
                user: currentUserData,
                socket: this.io,
            })

            reply.send({
                message: 'Access shared successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async updateFoundationAccess(request, reply) {
        const { id: userId } = request.user
        const { id } = request.params

        try {
            const roleRepo = new UserRoleRepository()
            const foundationRepo = new BloodFoundationRepository()
            const userRoleDTO = new UserRoleDTO()

            const userRole = await roleRepo.findOne({
                where: {
                    id,
                },
            })

            if (!userRole) {
                throw new Error('Access invitation not found')
            }

            const currentUserRole = await foundationRepo.getUserRoleStatus({
                userId,
                foundationId: userRole.organizationId,
            })

            if (
                !currentUserRole ||
                'active' !== currentUserRole.status ||
                ![ROLES.OWNER, ROLES.ADMIN].includes(currentUserRole.role)
            ) {
                throw new Error('Unauthorized action')
            }

            assign(userRoleDTO, {
                ...userRole.dataValues,
                ...request.body,
            })

            if (isRoleHigher(userRoleDTO.role, currentUserRole.role)) {
                throw new Error('Not allowed to update higher role access')
            }

            await roleRepo.update(userRoleDTO, { where: { id } })
            await roleRepo.socketUpdateUserRole({
                userRoleId: id,
                socket: this.io,
            })

            reply.send({
                message: 'Access updated successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async deleteFoundationAccess(request, reply) {
        const { id: userId } = request.user
        const { id } = request.params

        try {
            const roleRepo = new UserRoleRepository()
            const foundationRepo = new BloodFoundationRepository()

            const userRole = await roleRepo.findOne({
                where: {
                    id,
                },
            })

            if (!userRole) {
                throw new Error('Access invitation not found')
            }

            const currentUserRole = await foundationRepo.getUserRoleStatus({
                userId,
                foundationId: userRole.organizationId,
            })

            if (
                !currentUserRole ||
                'active' !== currentUserRole.status ||
                ![ROLES.OWNER, ROLES.ADMIN].includes(currentUserRole.role)
            ) {
                throw new Error('Unauthorized action')
            }

            if (isRoleHigher(userRole.role, currentUserRole.role)) {
                throw new Error('Not allowed to delete higher role access')
            }

            await roleRepo.socketDeleteUserRole({
                userRoleId: id,
                socket: this.io,
            })

            await roleRepo.destroy({
                where: {
                    id,
                },
            })

            reply.send({
                message: 'Access deleted successfully',
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async getFoundationAccessList(request, reply) {
        const { id: userId } = request.user
        const { foundationId } = request.params

        try {
            const roleRepo = new UserRoleRepository()
            const foundationRepo = new BloodFoundationRepository()
            const userRepo = new UserRepository()
            const currentUserRole = await foundationRepo.getUserRoleStatus({
                userId,
                foundationId,
            })

            if (
                !currentUserRole ||
                'active' !== currentUserRole.status ||
                ![ROLES.OWNER, ROLES.ADMIN].includes(currentUserRole.role)
            ) {
                throw new Error('Unauthorized action')
            }

            // Check if the foundation exists
            const foundation = await foundationRepo.findOne({
                where: {
                    id: foundationId,
                },
            })

            if (!foundation) {
                throw new Error('Foundation not found')
            }

            const roles = await roleRepo.findAll({
                where: {
                    organizationId: foundationId,
                },
                order: [['createdAt', 'DESC']],
            })

            const userIds = roles.map((role) => role.userId)
            const users = await userRepo.findAll({
                where: {
                    id: {
                        [Op.in]: userIds,
                    },
                },
            })

            users.forEach((user) => {
                const userRole = roles.find((role) => role.userId === user.id)
                if (userRole) {
                    userRole.setDataValue('userData', {
                        name: user.name,
                        mobile: user.mobile,
                        dialCode: user.dialCode,
                        profilePictureUrl: getFileUrl(
                            user.profilePictureUrl || PLACEHOLDER_AVATAR
                        ),
                    })
                }
            })

            reply.send({
                message: 'Access list fetched successfully',
                data: roles,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}

module.exports = BloodController
