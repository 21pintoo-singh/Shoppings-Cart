const productModel = require('../models/productModels')
const vfy = require('../utility/validation')
const { uploadFile } = require('../../aws.config')


// 📦 create product
const create = async (req, res) => {
    try {
        //  get data from Body
        const data = req.body
        const files = req.files
        // console.log(files)

        // 👉 if body OR file is empty
        if (vfy.isEmptyObject(data) && vfy.isEmptyVar(files)) return res.status(400).send({ status: !true, Message: " Product BODY required!" })

        // 👉 destructure data
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        //  Basic validations
        if (vfy.isEmptyVar(title)) return res.status(400).send({ status: !true, Message: " title is required!" })
        if (vfy.isEmptyVar(description)) return res.status(400).send({ status: !true, Message: "☹️ description is required!" })
        if (vfy.isEmptyVar(price)) return res.status(400).send({ status: !true, Message: " price is required!" })
        if (!Number(price)) return res.status(400).send({ status: !true, Message: " price must be a number!" })


        // if (!vfy.isEmptyVar(isFreeShipping)) {
        //     if (typeof isFreeShipping !== 'boolean') return res.status(400).send({ status: !true, Message: " isFreeShipping must be a boolean value!" })
        // }

        if (vfy.isEmptyVar(availableSizes)) return res.status(400).send({ status: !true, Message: " availableSizes is required!" })

        //  validation of availableSizes
        availableSizes = vfy.isValidJSONstr(availableSizes)
        if (!availableSizes) return res.status(400).send({ status: !true, Message: ` availableSizes is accept an array json like ["S", "XS", ...] !` })
        if (!vfy.checkArrContent(availableSizes, "S", "XS", "M", "X", "L", "XXL", "XL")) return res.status(400).send({ status: !true, Message: ` availableSizes is only accept S , XS , M , X , L , XXL , XL !` })

        // 👉 installments validation
        if (!vfy.isEmptyVar(installments)) {
            if (!Number(installments)) return res.status(400).send({ status: !true, Message: " installments must be a number!" })
        }

        // ⬆️ upload data validation
        if (vfy.isEmptyFile(files)) return res.status(400).send({ status: !true, Message: " productImage is required!" })
        if (!vfy.acceptFileType(files[0], 'image/jpeg', 'image/png')) return res.status(400).send({ status: !true, Message: " we accept jpg, jpeg or png as product image only!" })

        // 👉 execute DB call
        const productTitle = await productModel.findOne({ title })
        if (productTitle) return res.status(400).send({ status: !true, Message: " title already exist!" })

        // ⬆️ upload data here ------- 👇
        const productImage = await uploadFile(files[0])

        const rawData = { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage }

        // ✅ all done now create product
        const createProduct = await productModel.create(rawData)
        return res.status(201).send({ status: true, Message: "✅ Product created successfully!", data: createProduct })

    } catch (_) {
        res.status(500).send({ status: !true, Message: _.message })
    }

}


// get product list ----------------------------------------------------------------------------------->>
const getProduct = async function (req, res) {

    try {
        // 👉 fet query data 
        const query = req.query;
        const obj = {}
        const sort = {}
        if (!vfy.isEmptyObject(query)) {
            let availableSizes = query.size
            let title = query.name
            let priceGreaterThan = query.priceGreaterThan
            let priceLessThan = query.priceLessThan
            let priceSort = query.priceSort

            // if (availableSizes) { obj.availableSizes = availableSizes }
            if (!vfy.isEmptyVar(availableSizes)) { obj.availableSizes = { $in: availableSizes } }

            if (!vfy.isEmptyVar(title)) { obj.title = { $regex: title, $options: "i" } }

            if (!vfy.isEmptyVar(priceGreaterThan) && !vfy.isEmptyVar(priceLessThan)) {
                obj.price = { $gte: priceGreaterThan, $lte: priceLessThan }
            } else if (!vfy.isEmptyVar(priceGreaterThan)) {
                obj.price = { $gte: priceGreaterThan }
            }
            else if (!vfy.isEmptyVar(priceLessThan)) {
                obj.price = { $lte: priceLessThan }
            }

            if (priceSort) {
                if (priceSort != '-1' && priceSort != '1') return res.status(500).send({ status: false, Message: "priceSort only accept -1 and 1 as value" })
                sort.price = Number(priceSort)
            }

        }
        obj.isDeleted = false
        const getProductsList = await productModel.find(obj).sort(sort)
        if (!getProductsList || getProductsList.length == 0) return res.status(404).send({ status: false, Message: `product is not available in this moment try again later` })
        return res.status(200).send({ status: true, Message: `✅ ${getProductsList.length} Product${getProductsList.length == 1 ? " is" : "s are"} Matched`, data: getProductsList })

    } catch (err) {
        res.status(500).send({ status: false, Message: err.Message })
    }

}



// get product by id ----------------->>
const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!vfy.isValidObjectId(productId)) return res.status(400).send({ status: false, Message: ' Invalid productId' })

        // db call here
        const searchProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!searchProduct) return res.status(404).send({ status: false, Message: ' prouct does not exists' })
        res.status(200).send({ status: true, Message: '✅ Success', data: searchProduct })
    }
    catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }
}




// 👉 api for delete product --------------------------------
const deleteProduct = async (req, res) => {
    try {
        //👉 get params product id
        const productId = req.params.productId;

        // 👉 check product id is a valid object id or not
        if (!vfy.isValidObjectId(productId)) return res.status(400).send({ status: !true, Message: " Invalid ProjectID!" })

        //👉 find product by id
        const product = await productModel.findById(productId)
        if (!product) return res.status(404).send({ status: !true, Message: " Product information unavailable!" })
        if (product.isDeleted) return res.status(400).send({ status: !true, Message: " Product already deleted!" })

        // execute delete here
        product.isDeleted = true;
        product.deletedAt = new Date();
        await product.save();
        res.status(200).send({ status: true, Message: "✅ Product deleted successfully!" })
    } catch (_) {
        res.status(500).send({ status: true, Message: _.message })
    }
}



//----------------------------#Put api-------------------------------->>
const updateProductById = async function (req, res) {
    try {
        const requestBody = req.body
        const productId = req.params.productId
        const files = req.files
        if (vfy.isEmptyObject(requestBody) && vfy.isEmptyFile(files)) { return res.status(400).send({ status: false, Message: "Body is required" }) }
        if (!vfy.isValidObjectId(productId)) { return res.status(400).send({ status: false, Message: "Invalid productId" }) }
        const checkProductId = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProductId) { return res.status(404).send({ status: false, Message: 'Product not found' }) }

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = requestBody;

        // const checkProductId = {}


        if (!vfy.isEmptyVar(description)) { checkProductId.description = description }
        if (!vfy.isEmptyVar(price)) {
            if (!Number(price)) return res.status(400).send({ status: false, message: " price only accept numbers like [1-9]!" });
            checkProductId.price = price
        }
        if (!vfy.isEmptyVar(currencyId)) { checkProductId.currencyId = currencyId }
        if (!vfy.isEmptyVar(isFreeShipping)) { checkProductId.isFreeShipping = isFreeShipping }
        if (!vfy.isEmptyVar(currencyFormat)) { checkProductId.currencyFormat = currencyFormat }
        if (!vfy.isEmptyVar(style)) { checkProductId.style = style }
        if (!vfy.isEmptyVar(installments)) { checkProductId.installments = installments }
        if (!vfy.isEmptyVar(availableSizes)) {
            // approach 1
            let availableSizeObj = vfy.isValidJSONstr(availableSizes)
            if (!availableSizeObj) return res.status(400).send({ status: !true, Message: ` in availableSizes, invalid json !` })
            if (!Array.isArray(availableSizeObj)) return res.status(400).send({ status: !true, Message: ` in availableSizes, invalid array !` })
            if (!vfy.checkArrContent(availableSizeObj, "S", "XS", "M", "X", "L", "XXL", "XL")) return res.status(400).send({ status: !true, Message: ` availableSizes is only accept S , XS , M , X , L , XXL , XL !` })
            let tempArr = [...checkProductId.availableSizes]
            tempArr.push(...availableSizeObj)
            tempArr = [...new Set(tempArr)] // set {"S", "XS", "M"}
            checkProductId.availableSizes = tempArr

            // approach 2
            // if (Array.isArray(availableSizes)) {
            //     if (!vfy.checkArrContent(availableSizes, "S", "XS", "M", "X", "L", "XXL", "XL")) return res.status(400).send({ status: !true, Message: ` availableSizes is only accept S , XS , M , X , L , XXL , XL !` })
            //     checkProductId.availableSizes.push(...availableSizes)
            // } else {
            //     checkProductId.availableSizes.push(availableSizes)
            // }
            // console.log(typeof availableSizes)
        }

        if (!vfy.isEmptyVar(title)) {
            const isTitleAlreadyUsed = await productModel.findOne({ _id: { $ne: productId }, title: title });
            if (isTitleAlreadyUsed) { return res.status(400).send({ status: false, Message: `title, ${title} already exist ` }) }
            checkProductId.title = title
        }

        if (!vfy.isEmptyFile(files)) {
            if (!vfy.acceptFileType(files[0], 'image/jpeg', 'image/png')) return res.status(400).send({ status: !true, Message: "⚠️ we accept jpg, jpeg or png as product image only!" })
            const ProfilePicture = await uploadFile(files[0])
            checkProductId.productImage = ProfilePicture
        }

        await checkProductId.save();
        res.status(200).send({ status: true, message: "✅ Product info updated successfully!", data: checkProductId });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }

}

module.exports = { create, getProduct, getProductById, updateProductById, deleteProduct }