const Item = require('../models/Item');
const Treasure = require('../models/Activity');
const Traveller = require('../models/Booking');
const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Booking = require('../models/Booking');
const Member = require('../models/Member');

const { populate } = require('../models/Item');

module.exports = {
    landingPage : async (req, res) => {
        try {
            const mostPicked = await Item.find()
                .select(' _id title country city price unit imageId ')
                .limit(5)
                .populate({ path: 'imageId', select: 'imageUrl' })

                const category = await Category.find()
                    .select(' _id name ')
                    .limit(3)
                    .populate({ 
                        path: 'itemId', 
                        select: ' _id title country city isPopular imageId ',
                        perDocumentLimit: 4,
                        option: { sort: { sumBooking: -1 } }, //-1 descending 
                        populate: { 
                            path: 'imageId', 
                            select: '_id imageUrl',
                            perDocumentLimit: 1
                        } 
                    })

                const traveller = await Traveller.find();
                const treasure = await Treasure.find();
                const cities = await Item.find();

            for (let i = 0; i < category.length; i++) {
                for (let x = 0; x < category[i].itemId.length; x++) {
                    const item = await Item.findOne({ _id: category[i].itemId[x]._id });
                    item.isPopular = false;
                    await item.save();
                    if (category[i].itemId[0] === category[i].itemId[x]) {
                        item.isPopular = true;
                        await item.save();
                    }
                }
            }

            const testimonial = {
                _id: "asd1293uasdads1",
                imageUrl: "images/testimonial2.jpg",
                name: "Happy Family",
                rate: 5,
                content: "What a great trip with my family and I should try again next time soon ...",
                familyName: "Marco Abel Zefanya",
                familyOccupation: "Senior Programmer"
              }
            
            //di respon di postman
            res.status(200).json({ 
                hero: {
                    travelers: traveller.length,
                    treasures: treasure.length,
                    cities: cities.length
                },
                mostPicked,
                category,
                testimonial
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Internal Server Error"})
        }
    },
    detailPage: async (req,res) => {
        try {
            const { id } = req.params;
            const item = await Item.findOne({ _id: id })
                .populate({ path: 'featureId', select: 'id name qty imageUrl' })
                .populate({ path: 'activityId', select: 'id name type imageUrl' })
                .populate({ path: 'imageId', select: 'imageUrl' });

            const bank = await Bank.find();

            const testimonial = {
                _id: "asd1293uasdads1",
                imageUrl: "images/testimonial1.jpg",
                name: "Happy Family",
                rate: 5,
                content: "What a great trip with my family and I should try again next time soon ...",
                familyName: "Marco Abel Zefanya",
                familyOccupation: "Senior Programmer"
              }

            res.status(200).json({
                ...item._doc,
                bank,
                testimonial
            }) 
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    bookingPage: async (req, res) => {
        const { 
            idItem,
            duration,
            // price,
            bookingStartDate, 
            bookingEndDate, 
            firstName,
            lastName,
            email,
            phoneNumber,
            accountHolder,
            bankFrom,
        }   = req.body

        if (!req.file) {
            return res.status(404).json({ message: "Image Not Found" });
        }

        console.log(idItem);

        if (
            idItem === undefined || 
            duration === undefined || 
            // price === undefined || 
            bookingStartDate === undefined ||  
            bookingEndDate === undefined ||  
            firstName === undefined || 
            lastName === undefined || 
            email === undefined || 
            phoneNumber === undefined || 
            accountHolder === undefined || 
            bankFrom === undefined) {
            res.status(404).json({ message: "Lengkapi Semua Field" });
        }

        const item = await Item.findOne({ _id: idItem });

        if(!item) {
            return res.status(404).json({ message: "Item Not Found" });
        }

        item.sumBooking += 1;

        await item.save();

        let total = item.price * duration;
        let tax = total * 0.10;

        const invoice = Math.floor(1000000 + Math.random() * 9000000);

        const member = await Member.create({
            firstName,
            lastName,
            email,
            phoneNumber
        });

        const newBooking = {
            invoice,
            bookingStartDate,
            bookingEndDate,
            total: total += tax,
            itemId: {
                _id: item.id,
                title: item.title,
                price: item.price,
                duration: duration
            },

            memberId: member.id,
            payments: {
                proofPayment: `images/${req.file.filename}`,
                bankFrom: bankFrom,
                accountHolder: accountHolder
            }
        }

        const booking = await Booking.create(newBooking);

        //create / buat data baru pake 201
        res.status(201).json({ message: "Booking Success", booking });
    }
}