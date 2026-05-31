const validator = require('validator');

const validateStudent = (data) => {

    const mandatoryField = [
        'username',
        'email',
        'phoneNumber',
        'aadhar',
        'roomNo',
        'course',
        'collegeName',
        'year',
        'guardianName',
        'guardianPhone',
        'feeDue',
        'address'
    ];

    const isAllowed = mandatoryField.every(
        (k) => Object.keys(data).includes(k)
    );

    if (!isAllowed) {
        throw new Error(
            "Required field/fields are missing"
        );
    }

    // username validation
    if (
        data.username.length < 3 ||
        data.username.length > 50
    ) {
        throw new Error(
            "Username is too short/long"
        );
    }

    // guardian name validation
    if (
        data.guardianName.length < 3 ||
        data.guardianName.length > 50
    ) {
        throw new Error(
            "Guardian name is too short/long"
        );
    }

    // phone validation
    if (!validator.isMobilePhone(data.phoneNumber, 'en-IN') ) {
        throw new Error(
            "Invalid student phone number"
        );
    }

    if (
        !validator.isMobilePhone(data.guardianPhone,'en-IN' )) {
        throw new Error(
            "Invalid guardian phone number"
        );
    }

    // college validation
    if (data.collegeName.length > 70) {
        throw new Error(
            "College name too long"
        );
    }

    // aadhaar validation
    if (
        !/^[0-9]{12}$/.test(data.aadhar)
    ) {
        throw new Error(
            "Invalid Aadhaar number"
        );
    }

    // email validation
    if (!validator.isEmail(data.email)) {
        throw new Error("Invalid email");
    }

    // address validation
    if (
        !data.address ||
        typeof data.address !== "object"
    ) {
        throw new Error(
            "Address is required"
        );
    }

    const {
        village,
        city,
        state,
        pincode,
        country
    } = data.address;

    if (
        !city ||
        !state ||
        !pincode
    ) {
        throw new Error(
            "City, state and pincode are required"
        );
    }

    if (
        village &&
        village.length > 50
    ) {
        throw new Error(
            "Village name too long"
        );
    }

    if (city.length > 50) {
        throw new Error(
            "City name too long"
        );
    }

    if (state.length > 50) {
        throw new Error(
            "State name too long"
        );
    }

    if (
        !validator.isPostalCode(
            pincode,
            'IN'
        )
    ) {
        throw new Error(
            "Invalid pincode"
        );
    }

    if (
        country &&
        country.length > 50
    ) {
        throw new Error(
            "Country name too long"
        );
    }
};

module.exports = validateStudent;