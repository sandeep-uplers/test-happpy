

export default function ShimmerJobCard({ totalOpp, currentPage, bookMarkedTab }) {

    const getCount = () => {
        if (typeof totalOpp == 'undefined') return 5;
        let a = totalOpp - (currentPage * 10)
        if (a > 1) {
            if (a > 10) return 10
            return a
        }
        return 5
    }

    return (
        <>
            {bookMarkedTab ?
                <>
                    <LoadingCard />
                    <LoadingCard />
                    <LoadingCard />
                    <LoadingCard />
                    <LoadingCard />
                </>
                :
                <>
                    {[...new Array(getCount())].map(item => (
                        <LoadingCard />
                    ))}
                </>
            }
        </>
    )
}

const LoadingCard = () => {
    return (
        <div className={`shimmer-job-card`}>
            <div class="head">
                <div className="top">
                    <span className="image"></span>
                    <div class="right">
                        <span class="name"></span>
                        <span class="company"></span>
                    </div>
                </div>
            </div>
            <span class="attribs"></span>
            <span class="skills"></span>
        </div>
    )
}