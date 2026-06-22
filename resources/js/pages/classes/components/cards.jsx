import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../../../components/ui/card';

const Cards = ({img, promo,classNum, formation, date, coach, studentsNum ,...props}) => {
    return (
        <>
            <Card className="w-full h-full pt-0 max-w-sm rounded-2xl ">
                <div className=" ">
                    <img
                        className="h-50 w-full  rounded-t-2xl object-cover "
                        src={formation == "coding" ? "https://www.ko2.co.uk/wp-content/uploads/2024/03/Embedded-C-Code-Edit.jpg.webp" : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjzj2qptS9O_tX5Dspr3CdYekxYuCILcs5EA&s"}
                        alt=""
                    />
                </div>
                <CardHeader className="">
                    <CardTitle>{formation} {classNum ?? 1} - promo {promo ?? 0}</CardTitle>
                    <CardDescription>{date}</CardDescription>
                    <p className="">
                        Current Coach : <span>{coach}</span>
                    </p>
                    <p className="">
                        Students : <span>{studentsNum}</span>
                    </p>
                </CardHeader>
            </Card>
        </>
    );
};

export default Cards;
