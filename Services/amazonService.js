
function createAddToCartLink(amazonLink) {
    let amazon_asin = amazonLink.substring(amazonLink.indexOf("dp/") + 3, amazonLink.lastIndexOf("?"));
    return `https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=${amazon_asin}&Quantity.1=1`

}

module.exports = {
    createAddToCartLink
}