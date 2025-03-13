const { omit, assign, every, isPlainObject, isString, size } = require('lodash')
/**
 * Internal dependencies
 */
const BloodRepository = require('../repositories/BloodRepository')
const BloodFoundationDTO = require('../dtos/BloodFoundationDTO')
const Geocode = require('../geocode')
const Controller = require('./Controller')
const { getFileUrl } = require('../helpers')

class BloodController {
    static async getAllFoundations(request, reply) {
        const { district, id } = request.user

        try {
            const bloodRepository = new BloodRepository()
            const foundations = await bloodRepository.findAllFoundationBy({
                where: {
                    district,
                    userId: id,
                },
            })

            foundations.forEach((foundation) => {
                assign(foundation, {
                    thumbnailUrl: getFileUrl(
                        `${foundation.userId}/${foundation.thumbnailUrl}`
                    ),
                })
            })

            reply.send({
                message: 'Foundations fetched successfully',
                data: foundations,
            })
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static async createFoundation(request, reply) {
        const { district, id } = request.user
        const {
            name,
            thumbnailUrl,
            description,
            mobiles,
            socials,
            upazila,
            union,
        } = request.body

        try {
            if (!every(mobiles, BloodController.isValidMobileObj)) {
                throw new Error('Invalid mobiles')
            }

            if (!every(socials, BloodController.isValidSocialObj)) {
                throw new Error('Invalid socials')
            }

            if (!Geocode.isValid({ district, upazila, union })) {
                throw new Error('Invalid location')
            }

            const bloodRepository = new BloodRepository()
            const foundationDTO = new BloodFoundationDTO()

            foundationDTO.name = name
            foundationDTO.thumbnailUrl = thumbnailUrl
            foundationDTO.description = description
            foundationDTO.mobiles = mobiles
            foundationDTO.socials = socials
            foundationDTO.district = district
            foundationDTO.upazila = upazila
            foundationDTO.union = union
            foundationDTO.userId = id

            const foundationId =
                await bloodRepository.createFoundation(foundationDTO)
            const foundation = await bloodRepository.findOneFoundationBy(
                'id',
                foundationId
            )

            assign(foundation, {
                thumbnailUrl: getFileUrl(`${id}/${foundation.thumbnailUrl}`),
            })

            return {
                message: 'Foundation created successfully',
                data: foundation,
            }
        } catch (error) {
            Controller.handleError(reply, error)
        }
    }

    static isValidMobileObj(obj) {
        return (
            isPlainObject(obj) &&
            isString(obj.dialCode) &&
            obj.dialCode === '880' &&
            isString(obj.mobile) &&
            size(obj.mobile) === 10
        )
    }

    static isValidSocialObj(obj) {
        return isPlainObject(obj) && isString(obj.title) && isString(obj.url)
    }
}

module.exports = BloodController
