import { useEffect, useState } from 'react';
import Cards from './components/cards';
import Filter from './components/filter';

const Classes = ({ items, coaches }) => {
    const [field, setField] = useState('all');
    const [data, setData] = useState(items);
    
    const promos = [0, 1, 2, 3, 4, 5];
    const specialty = ['all', 'coding', 'media'];
    const [promo, setPromo] = useState(0);
    const [coach, setCoach] = useState("all");
    console.log(data);
    console.log(coaches);
    console.log(field);
    var filtered = items
    console.log();
    
    useEffect(() => {
        if (promo === 0) {
            // console.log('hi');

            filtered = items;
        } else {
            filtered = filtered.filter((c) => c.promo === promo);
        }
        if(field !== "all")
        {
            filtered = filtered.filter((c) => c.type === field);
        }
        if(coach !== "all")
        {
            filtered = filtered.filter((c) => c.coach === coach);
        }
        setData(filtered );
    }, [promo,field,coach]);

    return (
        <>
            <Filter
                onPromoChange={setPromo}
                onFieldChange={setField}
                onCoachChange={setCoach}
                coaches={["all", ...coaches]}
                promos={promos}
                Specialty={specialty}
            ></Filter>
            <div className="m-5 grid grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                {data.map((e) => {
                    return (
                        <Cards
                        classNum={e.class}
                            formation={e.type ? e.type : 'class'}
                            promo={e.promo ? e.promo : '?'}
                            coach={e.coach ? e.coach : '?'}
                            studentsNum={e.student_num ? e.student_num : '?'}
                        ></Cards>
                    );
                })}
            </div>
        </>
    );
};

export default Classes;
