/**
 * Internal dependencies
 */
const Controller = require('./controller')
const BloodFoundationDonorRepository = require('@/app/repositories/blood-foundation-donor')
const BloodFoundationDonorDTO = require('@/app/dtos/blood-foundation-donor')
const { getFileUrl, getFileFromPath } = require('@/app/helpers')
const { PLACEHOLDER_AVATAR } = require('@/app/helpers/constants')
const Geocode = require('@/app/geocode')
const { assign } = require('lodash')

module.exports = class FoundationWebsite {
    static async donorShortList(request, reply) {
        const { foundation } = request
        try {
            const donorRepo = new BloodFoundationDonorRepository()
            const donors = await donorRepo.findAndCountAll({
                where: {
                    foundationId: foundation.id,
                    status: 'active',
                },
                order: [['updatedAt', 'DESC']],
                limit: 11,
                offset: 0,
                attributes: [
                    'profilePictureUrl',
                    'bloodGroup',
                    'name',
                    'lastDonatedAt',
                ],
            })

            donors.rows.forEach((item) => {
                item.setDataValue(
                    'profilePictureUrl',
                    getFileUrl(item.profilePictureUrl || PLACEHOLDER_AVATAR)
                )
            })

            reply.send({
                message: 'Donor short list fetched successfully',
                data: {
                    donors: donors.rows,
                    total: donors.count,
                },
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async donorList(request, reply) {
        const { foundation } = request

        try {
            const searchTerm = request.query.search || ''
            const donorRepo = new BloodFoundationDonorRepository()

            const donorWhereTable = {
                foundationId: foundation.id,
                status: 'active',
            }

            if (request.query.bloodGroup) {
                donorWhereTable.bloodGroup = request.query.bloodGroup
            }

            if (request.query.upazila) {
                donorWhereTable.upazila = request.query.upazila
            }

            if (request.query.gender) {
                donorWhereTable.gender = request.query.gender
            }

            if (searchTerm) {
                donorWhereTable[Op.or] = [
                    { name: { [Op.like]: `%${searchTerm}%` } },
                ]
            }

            const donors = await donorRepo.findAndCountAll({
                where: donorWhereTable,
                order: [['updatedAt', 'DESC']],
                attributes: [
                    'profilePictureUrl',
                    'bloodGroup',
                    'name',
                    'gender',
                    'upazila',
                    'lastDonatedAt',
                ],
            })

            donors.rows.forEach((item) => {
                item.setDataValue(
                    'profilePictureUrl',
                    getFileUrl(item.profilePictureUrl || PLACEHOLDER_AVATAR)
                )
            })

            reply.send({
                message: 'Donors fetched successfully',
                data: {
                    donors: donors.rows,
                    total: donors.count,
                },
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async locations(request, reply) {
        const { foundation } = request
        try {
            const district = Geocode.getDistricts(
                (item) => item.id == foundation.district
            )

            const upazila = Geocode.getUpazilas(
                (item) => item.district_id == foundation.district
            )

            const municipality = Geocode.getMunicipalities((mun) => {
                return upazila.find((up) => up.id == mun.upazilla_id)
            })

            const union = Geocode.getUnions((un) => {
                return upazila.find((up) => up.id == un.upazilla_id)
            })

            reply.send({
                message: 'Geographical locations fetched successfully',
                data: {
                    district,
                    upazila,
                    municipality,
                    union,
                },
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async createDonor(request, reply) {
        const { foundation } = request
        try {
            const donorDTO = new BloodFoundationDonorDTO()
            const donorRepo = new BloodFoundationDonorRepository()

            assign(donorDTO, {
                ...request.body,
                foundationId: foundation.id,
                district: foundation.district,
                status: 'pending',
                description: '',
                profilePictureUrl: getFileFromPath(
                    request.body.profilePictureUrl
                ),
            })

            // await donorRepo.create(donorDTO)

            reply.send({
                message: 'Donor created successfully',
                data: donorDTO.toObject(),
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }
}
