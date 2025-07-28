const router = require("express").Router();
const ctr = require("../../controllers");

/**
 * @openapi
 * tags:
 *   - name: Product Management
 *     description: Stripe product creation, listing, updating, and deletion (Admin only)
 *   - name: Checkout
 *     description: Stripe checkout session management
 *   - name: Payouts
 *     description: Stripe payout information
 *   - name: Subscriptions
 *     description: Stripe subscription transactions
 *   - name: Balance
 *     description: Stripe balance information (Admin only)
 */

router

  /**
   * @openapi
   * tags:
   *   - name: Product Management
   *     description: Operations related to product and subscription management
   */

  /**
   * @openapi
   * /api/stripe/product:
   *   post:
   *     tags: [Product Management]
   *     summary: Create a new subscription product
   *     description: Creates a product with monthly and optional annual pricing plans
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - description
   *               - price_monthly
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Premium Plan"
   *               description:
   *                 type: string
   *                 example: "Full access to all features"
   *               is_free:
   *                 type: boolean
   *                 default: false
   *               credit_allocated:
   *                 type: integer
   *                 default: 0
   *                 example: 10000
   *               features:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["Feature 1", "Feature 2"]
   *               price_monthly:
   *                 type: integer
   *                 minimum: 0
   *                 example: 1999
   *               annual_discount:
   *                 type: number
   *                 minimum: 0
   *                 maximum: 0.99
   *                 default: 0.2
   *               activate_annual_plan:
   *                 type: boolean
   *                 default: true
   *               currency:
   *                 type: string
   *                 default: "eur"
   *                 enum: ["eur", "usd"]
   *     responses:
   *       201:
   *         description: Product created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 201
   *                 message:
   *                   type: string
   *                   example: "CREATE_PRODUCT_SUCCESS"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       example: "prod_ABC123"
   *                     name:
   *                       type: string
   *                       example: "Premium Plan"
   *                     description:
   *                       type: string
   *                       example: "Full access to all features"
   *                     active:
   *                       type: boolean
   *                       example: true
   *                     is_free:
   *                       type: boolean
   *                       example: false
   *                     prices:
   *                       type: object
   *                       properties:
   *                         monthly:
   *                           type: object
   *                           properties:
   *                             id:
   *                               type: string
   *                               example: "price_monthly_123"
   *                             amount:
   *                               type: number
   *                               example: 19.99
   *                             currency:
   *                               type: string
   *                               example: "eur"
   *                             interval:
   *                               type: string
   *                               example: "month"
   *                             interval_count:
   *                               type: integer
   *                               example: 1
   *                             nickname:
   *                               type: string
   *                               nullable: true
   *                               example: "Premium - Monthly"
   *                         yearly:
   *                           type: object
   *                           nullable: true
   *                           properties:
   *                             id:
   *                               type: string
   *                               example: "price_yearly_456"
   *                             amount:
   *                               type: number
   *                               example: 191.90
   *                             currency:
   *                               type: string
   *                               example: "eur"
   *                             interval:
   *                               type: string
   *                               example: "year"
   *                             interval_count:
   *                               type: integer
   *                               example: 1
   *                             nickname:
   *                               type: string
   *                               nullable: true
   *                               example: "Premium - Annual"
   *                     credit_allocated:
   *                       type: integer
   *                       example: 10000
   *                     features:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["Feature 1", "Feature 2"]
   *                     annual_discount:
   *                       type: number
   *                       example: 0.2
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2025-07-28T09:09:17.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2025-07-28T09:09:19.000Z"
   *       400:
   *         description: Invalid request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   enum:
   *                     - "MISSING_REQUIRED_FIELDS"
   *                     - "INVALID_DISCOUNT_VALUE"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 401
   *                 message:
   *                   type: string
   *                   example: "UNAUTHORIZED_ACCESS"
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 403
   *                 message:
   *                   type: string
   *                   example: "INSUFFICIENT_PERMISSIONS"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: "PRODUCT_CREATION_FAILED"
   */
  .post("/product", ctr.createProduct)

  /**
   * @openapi
   * /api/stripe/products:
   *   get:
   *     tags: [Product Management]
   *     summary: List all products
   *     description: Retrieve all products with pagination support
   *     parameters:
   *       - in: query
   *         name: active_only
   *         schema:
   *           type: boolean
   *         description: Filter only active products
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 100
   *         description: Maximum number of products to return
   *       - in: query
   *         name: starting_after
   *         schema:
   *           type: string
   *         description: Product ID for pagination cursor
   *     responses:
   *       200:
   *         description: List of products retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "PRODUCTS_RETRIEVED"
   *                 data:
   *                   type: object
   *                   properties:
   *                     count:
   *                       type: integer
   *                       example: 5
   *                     products:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             example: "prod_ABC123"
   *                           name:
   *                             type: string
   *                             example: "Premium Plan"
   *                           description:
   *                             type: string
   *                             example: "Full access to all features"
   *                           active:
   *                             type: boolean
   *                             example: true
   *                           is_free:
   *                             type: boolean
   *                             example: false
   *                           prices:
   *                             type: object
   *                             properties:
   *                               monthly:
   *                                 type: object
   *                                 nullable: true
   *                                 properties:
   *                                   id:
   *                                     type: string
   *                                     example: "price_monthly_123"
   *                                   amount:
   *                                     type: number
   *                                     example: 19.99
   *                                   currency:
   *                                     type: string
   *                                     example: "eur"
   *                                   interval:
   *                                     type: string
   *                                     example: "month"
   *                                   interval_count:
   *                                     type: integer
   *                                     example: 1
   *                                   nickname:
   *                                     type: string
   *                                     nullable: true
   *                                     example: "Premium - Monthly"
   *                               yearly:
   *                                 type: object
   *                                 nullable: true
   *                                 properties:
   *                                   id:
   *                                     type: string
   *                                     example: "price_yearly_456"
   *                                   amount:
   *                                     type: number
   *                                     example: 191.90
   *                                   currency:
   *                                     type: string
   *                                     example: "eur"
   *                                   interval:
   *                                     type: string
   *                                     example: "year"
   *                                   interval_count:
   *                                     type: integer
   *                                     example: 1
   *                                   nickname:
   *                                     type: string
   *                                     nullable: true
   *                                     example: "Premium - Annual"
   *                           credit_allocated:
   *                             type: integer
   *                             example: 10000
   *                           features:
   *                             type: array
   *                             items:
   *                               type: string
   *                             example: ["Feature 1", "Feature 2"]
   *                           annual_discount:
   *                             type: number
   *                             example: 0.2
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                             example: "2025-07-28T09:09:17.000Z"
   *                           updatedAt:
   *                             type: string
   *                             format: date-time
   *                             example: "2025-07-28T09:09:19.000Z"
   *                     pagination:
   *                       type: object
   *                       properties:
   *                         has_more:
   *                           type: boolean
   *                           example: true
   *                         next_starting_after:
   *                           type: string
   *                           example: "prod_DEF456"
   *       404:
   *         description: No products found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 404
   *                 message:
   *                   type: string
   *                   example: "PRODUCTS_NOT_FOUND"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: "PRODUCTS_RETRIEVAL_FAILED"
   */
  .get("/products", ctr.getProducts)
  /**
   * @openapi
   * /api/stripe/product/{id}:
   *   get:
   *     tags: [Product Management]
   *     summary: Get product details
   *     description: Retrieve detailed information about a specific product
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe product ID
   *     responses:
   *       200:
   *         description: Product details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "PRODUCT_RETRIEVED"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       example: "prod_ABC123"
   *                     name:
   *                       type: string
   *                       example: "Premium Plan"
   *                     description:
   *                       type: string
   *                       example: "Full access to all features"
   *                     active:
   *                       type: boolean
   *                       example: true
   *                     is_free:
   *                       type: boolean
   *                       example: false
   *                     prices:
   *                       type: object
   *                       properties:
   *                         monthly:
   *                           type: object
   *                           properties:
   *                             id:
   *                               type: string
   *                               example: "price_monthly_123"
   *                             amount:
   *                               type: number
   *                               example: 19.99
   *                             currency:
   *                               type: string
   *                               example: "eur"
   *                             interval:
   *                               type: string
   *                               example: "month"
   *                             interval_count:
   *                               type: integer
   *                               example: 1
   *                             nickname:
   *                               type: string
   *                               nullable: true
   *                               example: "Premium - Monthly"
   *                         yearly:
   *                           type: object
   *                           nullable: true
   *                           properties:
   *                             id:
   *                               type: string
   *                               example: "price_yearly_456"
   *                             amount:
   *                               type: number
   *                               example: 191.90
   *                             currency:
   *                               type: string
   *                               example: "eur"
   *                             interval:
   *                               type: string
   *                               example: "year"
   *                             interval_count:
   *                               type: integer
   *                               example: 1
   *                             nickname:
   *                               type: string
   *                               nullable: true
   *                               example: "Premium - Annual"
   *                     credit_allocated:
   *                       type: integer
   *                       example: 10000
   *                     features:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["Feature 1", "Feature 2"]
   *                     annual_discount:
   *                       type: number
   *                       example: 0.2
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2025-07-28T09:09:17.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2025-07-28T09:09:19.000Z"
   *       400:
   *         description: Invalid request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: "PRODUCT_ID_REQUIRED"
   *       404:
   *         description: Product not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 404
   *                 message:
   *                   type: string
   *                   example: "PRODUCT_NOT_FOUND"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: "PRODUCT_RETRIEVAL_FAILED"
   */
  .get("/product/:id", ctr.getProductById)
  /**
   * @openapi
   * /api/stripe/product/{id}:
   *   put:
   *     tags: [Product Management]
   *     summary: Update a product
   *     description: Update product details and pricing (Admin only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe product ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Updated Premium Plan"
   *               description:
   *                 type: string
   *                 example: "Updated feature set"
   *               credit_allocated:
   *                 type: integer
   *                 example: 15000
   *               features:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["Feature 1", "Feature 2", "New Feature"]
   *               price_monthly:
   *                 type: integer
   *                 example: 2499
   *               annual_discount:
   *                 type: number
   *                 example: 0.25
   *               activate_annual_plan:
   *                 type: boolean
   *                 example: true
   *               currency:
   *                 type: string
   *                 example: "eur"
   *     responses:
   *       200:
   *         description: Product updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "PRODUCT_UPDATED"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       example: "prod_ABC123"
   *                     name:
   *                       type: string
   *                       example: "Updated Premium Plan"
   *                     description:
   *                       type: string
   *                       example: "Updated feature set"
   *                     active:
   *                       type: boolean
   *                       example: true
   *                     is_free:
   *                       type: boolean
   *                       example: false
   *                     prices:
   *                       type: object
   *                       properties:
   *                         monthly:
   *                           type: object
   *                           properties:
   *                             id:
   *                               type: string
   *                               example: "price_monthly_789"
   *                             amount:
   *                               type: number
   *                               example: 24.99
   *                             currency:
   *                               type: string
   *                               example: "eur"
   *                             interval:
   *                               type: string
   *                               example: "month"
   *                             interval_count:
   *                               type: integer
   *                               example: 1
   *                             nickname:
   *                               type: string
   *                               nullable: true
   *                               example: "Updated Premium - Monthly"
   *                         yearly:
   *                           type: object
   *                           nullable: true
   *                           properties:
   *                             id:
   *                               type: string
   *                               example: "price_yearly_789"
   *                             amount:
   *                               type: number
   *                               example: 224.91
   *                             currency:
   *                               type: string
   *                               example: "eur"
   *                             interval:
   *                               type: string
   *                               example: "year"
   *                             interval_count:
   *                               type: integer
   *                               example: 1
   *                             nickname:
   *                               type: string
   *                               nullable: true
   *                               example: "Updated Premium - Annual"
   *                     credit_allocated:
   *                       type: integer
   *                       example: 15000
   *                     features:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["Feature 1", "Feature 2", "New Feature"]
   *                     annual_discount:
   *                       type: number
   *                       example: 0.25
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2025-07-28T09:09:17.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2025-07-28T10:15:22.000Z"
   *       400:
   *         description: Invalid request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: "MISSING_REQUIRED_FIELDS"
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 403
   *                 message:
   *                   type: string
   *                   example: "CANNOT_MODIFY_FREE_PLAN"
   *       404:
   *         description: Product not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 404
   *                 message:
   *                   type: string
   *                   example: "PRODUCT_NOT_FOUND"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: "PRODUCT_UPDATE_FAILED"
   */
  .put("/product/:id", ctr.updateProduct)
  /**
   * @openapi
   * /api/stripe/product/{id}:
   *   delete:
   *     tags: [Product Management]
   *     summary: Delete a product
   *     description: Permanently delete a product (Admin only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe product ID
   *     responses:
   *       200:
   *         description: Product deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "PRODUCT_DELETED"
   *       400:
   *         description: Invalid request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: "MISSING_PRODUCT_ID"
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 403
   *                 message:
   *                   type: string
   *                   enum:
   *                     - "INSUFFICIENT_PERMISSIONS"
   *                     - "CANNOT_DELETE_FREE_PLAN"
   *                     - "PRODUCT_HAS_ACTIVE_SUBSCRIPTIONS"
   *       404:
   *         description: Product not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 404
   *                 message:
   *                   type: string
   *                   example: "PRODUCT_NOT_FOUND"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: "DELETE_PRODUCT_ERROR"
   */
  .delete("/product/:id", ctr.deleteProduct)

  /**
   * @openapi
   * /api/stripe/checkout/{price_id}:
   *   post:
   *     tags: [Checkout]
   *     summary: Create a checkout session
   *     description: Create a Stripe checkout session for a subscription
   *     parameters:
   *       - in: path
   *         name: price_id
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe price ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               quantity:
   *                 type: integer
   *                 default: 1
   *                 description: Quantity of items to purchase
   *               customer_email:
   *                 type: string
   *                 format: email
   *                 description: Customer email to pre-fill
   *               metadata:
   *                 type: object
   *                 description: Additional metadata to attach to the session
   *     responses:
   *       201:
   *         description: Checkout session created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 201
   *                 message:
   *                   type: string
   *                   example: CHECKOUT_SESSION_CREATED
   *                 data:
   *                   type: object
   *                   properties:
   *                     sessionId:
   *                       type: string
   *                     url:
   *                       type: string
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   enum:
   *                     - MISSING_PRICE_ID
   *                     - STRIPE_INVALID_REQUEST
   *                     - STRIPE_PRODUCT_NOT_ACTIVE
   *                     - STRIPE_INVALID_LINE_ITEM
   *       402:
   *         description: Payment required
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 402
   *                 message:
   *                   type: string
   *                   example: STRIPE_CARD_DECLINED
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   enum:
   *                     - CHECKOUT_SESSION_FAILED
   *                     - STRIPE_UNKNOWN_ERROR
   *                     - STRIPE_API_ERROR
   *                     - STRIPE_CONNECTION_ERROR
   */
  .post("/checkout/:price_id", ctr.createCheckoutSession)

  /**
   * @openapi
   * /api/stripe/checkout/session/{session_id}:
   *   get:
   *     tags: [Checkout]
   *     summary: Get checkout session details
   *     description: Retrieve detailed information about a checkout session
   *     parameters:
   *       - in: path
   *         name: session_id
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe checkout session ID
   *     responses:
   *       200:
   *         description: Session details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: SESSION_DETAILS_RETRIEVED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     status:
   *                       type: string
   *                     customer:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                         email:
   *                           type: string
   *                         name:
   *                           type: string
   *                     payment_status:
   *                       type: string
   *                     subscription:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                         status:
   *                           type: string
   *                         current_period_end:
   *                           type: integer
   *                         current_period_start:
   *                           type: integer
   *                     items:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                           quantity:
   *                             type: integer
   *                           price:
   *                             type: object
   *                           product:
   *                             type: object
   *                     amount_total:
   *                       type: integer
   *                     currency:
   *                       type: string
   *                     created:
   *                       type: string
   *                       format: date-time
   *                     expires_at:
   *                       type: string
   *                       format: date-time
   *                     url:
   *                       type: string
   *                     metadata:
   *                       type: object
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: MISSING_SESSION_ID
   *       404:
   *         description: Session not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 404
   *                 message:
   *                   type: string
   *                   example: RESOURCE_NOT_FOUND
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   enum:
   *                     - SESSION_RETRIEVAL_FAILED
   *                     - STRIPE_UNKNOWN_ERROR
   *                     - STRIPE_API_ERROR
   *                     - STRIPE_CONNECTION_ERROR
   */
  .get("/checkout/session/:session_id", ctr.getCheckoutSessionDetails)

  /**
   * @openapi
   * /api/stripe/subscription:
   *   post:
   *     tags: [Subscriptions]
   *     summary: Create a subscription checkout session
   *     description: Creates a Stripe checkout session for a new subscription
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - price_id
   *             properties:
   *               price_id:
   *                 type: string
   *                 description: Stripe price ID for the subscription plan
   *               customer_email:
   *                 type: string
   *                 format: email
   *                 description: Customer email address
   *               quantity:
   *                 type: integer
   *                 default: 1
   *                 description: Quantity of subscriptions
   *               metadata:
   *                 type: object
   *                 description: Additional metadata to attach to the subscription
   *     responses:
   *       200:
   *         description: Checkout session created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: SUBSCRIPTION_CHECKOUT_CREATED
   *                 data:
   *                   type: object
   *                   properties:
   *                     sessionId:
   *                       type: string
   *                       description: Stripe checkout session ID
   *                     url:
   *                       type: string
   *                       description: URL to redirect user to complete checkout
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: MISSING_PRICE_ID
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: SUBSCRIPTION_CREATION_ERROR
   */

  .post("/subscription", ctr.createCheckoutSession)

  /**
   * @openapi
   * /api/stripe/subscription/{subscription_id}/transactions:
   *   get:
   *     tags: [Subscriptions]
   *     summary: Get subscription transactions
   *     description: Retrieve all transactions (invoices) for a specific subscription
   *     parameters:
   *       - in: path
   *         name: subscription_id
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe subscription ID
   *     responses:
   *       200:
   *         description: Subscription transactions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: SUBSCRIPTION_TRANSACTIONS_RETRIEVED
   *                 data:
   *                   type: object
   *                   properties:
   *                     subscription:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                         status:
   *                           type: string
   *                         current_period_end:
   *                           type: string
   *                           format: date-time
   *                         current_period_start:
   *                           type: string
   *                           format: date-time
   *                         customer:
   *                           type: string
   *                     invoices:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                           status:
   *                             type: string
   *                           amount_due:
   *                             type: integer
   *                           amount_paid:
   *                             type: integer
   *                           currency:
   *                             type: string
   *                           created:
   *                             type: string
   *                             format: date-time
   *                           payment_intent:
   *                             type: string
   *                           hosted_invoice_url:
   *                             type: string
   *                           period_start:
   *                             type: string
   *                             format: date-time
   *                           period_end:
   *                             type: string
   *                             format: date-time
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: MISSING_SUBSCRIPTION_ID
   *       404:
   *         description: Subscription not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 404
   *                 message:
   *                   type: string
   *                   example: RESOURCE_NOT_FOUND
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   enum:
   *                     - SUBSCRIPTION_TRANSACTIONS_FAILED
   *                     - STRIPE_UNKNOWN_ERROR
   *                     - STRIPE_API_ERROR
   *                     - STRIPE_CONNECTION_ERROR
   */
  .get(
    "/subscription/:subscription_id/transactions",
    ctr.getSubscriptionTransactions
  )
  /**
   * @openapi
   * /api/stripe/subscriptions/customer/{customer_id}:
   *   get:
   *     tags: [Subscriptions]
   *     summary: List customer subscriptions
   *     description: Retrieves all subscriptions for a specific Stripe customer
   *     parameters:
   *       - in: path
   *         name: customer_id
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe customer ID
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Maximum number of subscriptions to return
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, past_due, unpaid, canceled, incomplete, incomplete_expired, all]
   *           default: all
   *         description: Filter subscriptions by status
   *     responses:
   *       200:
   *         description: Subscriptions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: SUBSCRIPTIONS_RETRIEVED
   *                 data:
   *                   type: object
   *                   properties:
   *                     subscriptions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             description: Subscription ID
   *                           status:
   *                             type: string
   *                             description: Subscription status
   *                           current_period_start:
   *                             type: string
   *                             format: date-time
   *                             description: Start date of current billing period
   *                           current_period_end:
   *                             type: string
   *                             format: date-time
   *                             description: End date of current billing period
   *                           cancel_at_period_end:
   *                             type: boolean
   *                             description: Whether subscription will cancel at period end
   *                           plan:
   *                             type: string
   *                             description: Stripe product ID for the plan
   *                           amount:
   *                             type: integer
   *                             description: Subscription amount in cents
   *                           currency:
   *                             type: string
   *                             description: Currency code
   *                           interval:
   *                             type: string
   *                             description: Billing interval (day, week, month, year)
   *                           interval_count:
   *                             type: integer
   *                             description: Number of intervals between billings
   *                           payment_method:
   *                             type: object
   *                             description: Default payment method details
   *                             properties:
   *                               id:
   *                                 type: string
   *                               type:
   *                                 type: string
   *                               card:
   *                                 type: object
   *                                 properties:
   *                                   brand:
   *                                     type: string
   *                                   last4:
   *                                     type: string
   *                     has_more:
   *                       type: boolean
   *                       description: Whether there are more subscriptions to retrieve
   *                     total_count:
   *                       type: integer
   *                       description: Total number of subscriptions
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: MISSING_CUSTOMER_ID
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: LIST_SUBSCRIPTIONS_ERROR
   */

  .get("/subscriptions/customer/:customer_id", ctr.listCustomerSubscriptions)
  /**
   * @openapi
   * /api/stripe/subscription/{subscription_id}:
   *   put:
   *     tags: [Subscriptions]
   *     summary: Update a subscription
   *     description: Updates an existing subscription (change plan, quantity, etc.)
   *     parameters:
   *       - in: path
   *         name: subscription_id
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe subscription ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               price_id:
   *                 type: string
   *                 description: New Stripe price ID
   *               quantity:
   *                 type: integer
   *                 description: New quantity
   *               proration_behavior:
   *                 type: string
   *                 enum: [create_prorations, none, always_invoice]
   *                 default: create_prorations
   *                 description: How to handle prorations
   *     responses:
   *       200:
   *         description: Subscription updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: SUBSCRIPTION_UPDATED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       description: Subscription ID
   *                     status:
   *                       type: string
   *                       description: Subscription status
   *                     current_period_end:
   *                       type: string
   *                       format: date-time
   *                       description: End date of current billing period
   *                     items:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             description: Subscription item ID
   *                           price:
   *                             type: object
   *                             properties:
   *                               id:
   *                                 type: string
   *                               product:
   *                                 type: string
   *                               unit_amount:
   *                                 type: integer
   *                               currency:
   *                                 type: string
   *                           quantity:
   *                             type: integer
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: MISSING_SUBSCRIPTION_ID
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: SUBSCRIPTION_UPDATE_ERROR
   */

  .put("/subscription/:subscription_id", ctr.updateSubscription)

  /**
   * @openapi
   * /api/stripe/subscription/{subscription_id}:
   *   delete:
   *     tags: [Subscriptions]
   *     summary: Cancel a subscription
   *     description: Cancels a subscription immediately or at period end
   *     parameters:
   *       - in: path
   *         name: subscription_id
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe subscription ID
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               cancel_immediately:
   *                 type: boolean
   *                 default: false
   *                 description: Whether to cancel immediately or at period end
   *     responses:
   *       200:
   *         description: Subscription cancelled successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   oneOf:
   *                     - example: SUBSCRIPTION_CANCELLED_IMMEDIATELY
   *                     - example: SUBSCRIPTION_CANCELLED_AT_PERIOD_END
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       description: Subscription ID
   *                     status:
   *                       type: string
   *                       description: Subscription status
   *                     cancel_at_period_end:
   *                       type: boolean
   *                       description: Whether subscription will cancel at period end
   *                     current_period_end:
   *                       type: string
   *                       format: date-time
   *                       description: End date of current billing period
   *                     canceled_at:
   *                       type: string
   *                       format: date-time
   *                       nullable: true
   *                       description: When subscription was canceled
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: MISSING_SUBSCRIPTION_ID
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: SUBSCRIPTION_CANCEL_ERROR
   */
  .delete("/subscription/:subscription_id", ctr.cancelSubscription)

  /**
   * @openapi
   * /api/stripe/payout:
   *   post:
   *     tags: [Payouts]
   *     summary: Create a payout
   *     description: Create a new payout to your bank account
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *             properties:
   *               amount:
   *                 type: integer
   *                 description: Amount in cents to payout
   *               currency:
   *                 type: string
   *                 default: usd
   *               description:
   *                 type: string
   *               statement_descriptor:
   *                 type: string
   *               destination:
   *                 type: string
   *               metadata:
   *                 type: object
   *     responses:
   *       201:
   *         description: Payout created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 201
   *                 message:
   *                   type: string
   *                   example: PAYOUT_CREATED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     amount:
   *                       type: integer
   *                     currency:
   *                       type: string
   *                     arrival_date:
   *                       type: string
   *                       format: date-time
   *                     description:
   *                       type: string
   *                     status:
   *                       type: string
   *                     method:
   *                       type: string
   *                     source_type:
   *                       type: string
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: INVALID_AMOUNT
   *       402:
   *         description: Payment required
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 402
   *                 message:
   *                   type: string
   *                   example: INSUFFICIENT_FUNDS
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   enum:
   *                     - PAYOUT_CREATION_FAILED
   *                     - STRIPE_UNKNOWN_ERROR
   *                     - STRIPE_API_ERROR
   *                     - STRIPE_CONNECTION_ERROR
   */
  .post("/payout", ctr.createPayout)
  /**
   * @openapi
   * /api/stripe/payout/{payout_id}:
   *   get:
   *     tags: [Payouts]
   *     summary: Get payout details
   *     description: Retrieve detailed information about a specific payout
   *     parameters:
   *       - in: path
   *         name: payout_id
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe payout ID
   *     responses:
   *       200:
   *         description: Payout details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: PAYOUT_DETAILS_RETRIEVED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     amount:
   *                       type: integer
   *                     currency:
   *                       type: string
   *                     arrival_date:
   *                       type: string
   *                       format: date-time
   *                     created:
   *                       type: string
   *                       format: date-time
   *                     description:
   *                       type: string
   *                     destination:
   *                       type: string
   *                     method:
   *                       type: string
   *                     source_type:
   *                       type: string
   *                     status:
   *                       type: string
   *                     type:
   *                       type: string
   *                     metadata:
   *                       type: object
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: MISSING_PAYOUT_ID
   *       404:
   *         description: Payout not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 404
   *                 message:
   *                   type: string
   *                   example: RESOURCE_NOT_FOUND
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   enum:
   *                     - PAYOUT_RETRIEVAL_FAILED
   *                     - STRIPE_UNKNOWN_ERROR
   *                     - STRIPE_API_ERROR
   *                     - STRIPE_CONNECTION_ERROR
   */
  .get("/payouts/:payout_id", ctr.getPayoutDetails)

  /**
   * @openapi
   * /api/stripe/payouts:
   *   get:
   *     tags: [Payouts]
   *     summary: List payouts
   *     description: List all payouts with pagination and filtering options
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of payouts to return
   *       - in: query
   *         name: starting_after
   *         schema:
   *           type: string
   *         description: A cursor for pagination (payout ID)
   *       - in: query
   *         name: ending_before
   *         schema:
   *           type: string
   *         description: A cursor for pagination (payout ID)
   *       - in: query
   *         name: created_after
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter payouts created after this date
   *       - in: query
   *         name: created_before
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter payouts created before this date
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [paid, pending, in_transit, canceled, failed]
   *         description: Filter payouts by status
   *     responses:
   *       200:
   *         description: Payouts retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: PAYOUTS_RETRIEVED
   *                 data:
   *                   type: object
   *                   properties:
   *                     payouts:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                           amount:
   *                             type: integer
   *                           currency:
   *                             type: string
   *                           arrival_date:
   *                             type: string
   *                             format: date-time
   *                           created:
   *                             type: string
   *                             format: date-time
   *                           description:
   *                             type: string
   *                           destination:
   *                             type: string
   *                           status:
   *                             type: string
   *                           method:
   *                             type: string
   *                     has_more:
   *                       type: boolean
   *                     total_count:
   *                       type: integer
   *                     url:
   *                       type: string
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   enum:
   *                     - PAYOUTS_LISTING_FAILED
   *                     - STRIPE_UNKNOWN_ERROR
   *                     - STRIPE_API_ERROR
   *                     - STRIPE_CONNECTION_ERROR
   */
  .get("/payouts", ctr.listPayouts)

  /**
   * @openapi
   * /api/stripe/payout/{payout_id}:
   *   delete:
   *     tags: [Payouts]
   *     summary: Cancel a payout
   *     description: Cancel a pending payout
   *     parameters:
   *       - in: path
   *         name: payout_id
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe payout ID
   *     responses:
   *       200:
   *         description: Payout cancelled successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: PAYOUT_CANCELLED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     status:
   *                       type: string
   *                     amount:
   *                       type: integer
   *                     currency:
   *                       type: string
   *                     arrival_date:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: MISSING_PAYOUT_ID
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 403
   *                 message:
   *                   type: string
   *                   example: PAYOUT_CANCEL_NOT_ALLOWED
   *       404:
   *         description: Payout not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 404
   *                 message:
   *                   type: string
   *                   example: RESOURCE_NOT_FOUND
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   enum:
   *                     - PAYOUT_CANCELLATION_FAILED
   *                     - STRIPE_UNKNOWN_ERROR
   *                     - STRIPE_API_ERROR
   *                     - STRIPE_CONNECTION_ERROR
   */
  .delete("/payout/:payout_id", ctr.cancelPayout)

  /**
   * @openapi
   * /api/stripe/payout/{payout_id}:
   *   put:
   *     tags: [Payouts]
   *     summary: Update payout metadata
   *     description: Update metadata for a specific payout
   *     parameters:
   *       - in: path
   *         name: payout_id
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe payout ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - metadata
   *             properties:
   *               metadata:
   *                 type: object
   *                 description: Key-value pairs to update
   *     responses:
   *       200:
   *         description: Payout metadata updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: PAYOUT_UPDATED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     metadata:
   *                       type: object
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   enum:
   *                     - MISSING_PAYOUT_ID
   *                     - MISSING_METADATA
   *       404:
   *         description: Payout not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 404
   *                 message:
   *                   type: string
   *                   example: RESOURCE_NOT_FOUND
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   enum:
   *                     - PAYOUT_UPDATE_FAILED
   *                     - STRIPE_UNKNOWN_ERROR
   *                     - STRIPE_API_ERROR
   *                     - STRIPE_CONNECTION_ERROR
   */
  .put("/payout/:payout_id", ctr.updatePayoutMetadata)

  /**
   * @openapi
   * /api/stripe/payout/{payout_id}/transactions:
   *   get:
   *     tags: [Payouts]
   *     summary: Get payout transactions
   *     description: Retrieve all balance transactions related to a specific payout
   *     parameters:
   *       - in: path
   *         name: payout_id
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe payout ID
   *     responses:
   *       200:
   *         description: Payout transactions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: PAYOUT_TRANSACTIONS_RETRIEVED
   *                 data:
   *                   type: object
   *                   properties:
   *                     payout_id:
   *                       type: string
   *                     transactions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                           amount:
   *                             type: integer
   *                           currency:
   *                             type: string
   *                           description:
   *                             type: string
   *                           fee:
   *                             type: integer
   *                           net:
   *                             type: integer
   *                           status:
   *                             type: string
   *                           type:
   *                             type: string
   *                           created:
   *                             type: string
   *                             format: date-time
   *                           source_type:
   *                             type: string
   *                           source_id:
   *                             type: string
   *                     has_more:
   *                       type: boolean
   *                     total_count:
   *                       type: integer
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: MISSING_PAYOUT_ID
   *       404:
   *         description: Payout not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 404
   *                 message:
   *                   type: string
   *                   example: RESOURCE_NOT_FOUND
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   enum:
   *                     - PAYOUT_TRANSACTIONS_FAILED
   *                     - STRIPE_UNKNOWN_ERROR
   *                     - STRIPE_API_ERROR
   *                     - STRIPE_CONNECTION_ERROR
   */
  .get("/payout/:payout_id/transactions", ctr.getPayoutTransactions)
  /**
   * @openapi
   * /api/stripe/payout/instant:
   *   post:
   *     tags: [Payouts]
   *     summary: Create instant payout
   *     description: Create an instant payout (if eligible)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *             properties:
   *               amount:
   *                 type: integer
   *                 description: Amount in cents to payout
   *               currency:
   *                 type: string
   *                 default: usd
   *               description:
   *                 type: string
   *               statement_descriptor:
   *                 type: string
   *               destination:
   *                 type: string
   *               metadata:
   *                 type: object
   *     responses:
   *       201:
   *         description: Instant payout created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 201
   *                 message:
   *                   type: string
   *                   example: INSTANT_PAYOUT_CREATED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     amount:
   *                       type: integer
   *                     currency:
   *                       type: string
   *                     arrival_date:
   *                       type: string
   *                       format: date-time
   *                     description:
   *                       type: string
   *                     status:
   *                       type: string
   *                     method:
   *                       type: string
   *                     source_type:
   *                       type: string
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: INVALID_AMOUNT
   *       402:
   *         description: Payment required
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 402
   *                 message:
   *                   type: string
   *                   example: INSUFFICIENT_FUNDS
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 403
   *                 message:
   *                   type: string
   *                   enum:
   *                     - BANK_ACCOUNT_NOT_ELIGIBLE
   *                     - INSTANT_PAYOUT_DISABLED
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: INSTANT_PAYOUT_FAILED
   */
  .post("/payout/instant", ctr.createInstantPayout)

  /**
   * @openapi
   * /api/stripe/balance:
   *   get:
   *     tags: [Balance]
   *     summary: Get available balance
   *     description: Retrieve your available payout balance from Stripe
   *     responses:
   *       200:
   *         description: Balance retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: BALANCE_RETRIEVED
   *                 data:
   *                   type: object
   *                   properties:
   *                     available:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           currency:
   *                             type: string
   *                           amount:
   *                             type: integer
   *                           source_types:
   *                             type: object
   *                     pending:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           currency:
   *                             type: string
   *                           amount:
   *                             type: integer
   *                           source_types:
   *                             type: object
   *                     connect_reserved:
   *                       type: array
   *                     instant_available:
   *                       type: array
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   enum:
   *                     - BALANCE_RETRIEVAL_FAILED
   *                     - STRIPE_UNKNOWN_ERROR
   *                     - STRIPE_API_ERROR
   *                     - STRIPE_CONNECTION_ERROR
   */
  .get("/balance", ctr.getAvailableBalance);

module.exports = router;
