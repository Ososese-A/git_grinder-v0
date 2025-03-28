import { useEffect, useState } from 'react';
import './App.css'

const App = () => {
  const [gitData, setGitData] = useState([])
  const [dataFetch, setDataFetch] = useState(false)
  const [totalContribution, setTotalContribution] = useState("")
  const [timeline, setTimeline] = useState<any[]>([])
  const [username, setUsername] = useState("Ososese-A")
  // const [username, setUsername] = useState("WisdomLota")


  useEffect(() => {
    const backendData = async () => {
      const auth = "Authorized"
      const backendResponse = await fetch(`http://localhost:8080/mockRoute/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization' : `Bearer ${auth}`
        }
      })

      const result = await backendResponse.json()
      console.log(result)
      setGitData(result)
      setTotalContribution(result.data.user.contributionsCollection.contributionCalendar.totalContributions)
      setTimeline(result.data.user.contributionsCollection.contributionCalendar.weeks)
    }

    if (dataFetch) {
      backendData()
      setDataFetch(false)
    }

  }, [dataFetch])

  const fetchGitData = () => {
    setDataFetch(true)
  }


  return ( 
    <>
      <div className='bg-[#22272E] text-white w-full'>
        <h1>{username}</h1>
        <h1>{totalContribution}</h1>
        <div onClick={fetchGitData}>Mime</div>
        <div className='flex mx-auto'>{timeline.map((tl, index) => {
          console.log(tl.contributionDays[0].date)
          return (
            <div key={index}>
              {index + 1}
              {tl.contributionDays.map((elem: {date: string, contributionCount: number}) => {
                let contributionBox 

                switch (true) {
                  case elem.contributionCount === 0:
                    contributionBox = <div className='h-3 w-3 bg-[#2D323A] m-1'></div>
                    break
                  case elem.contributionCount > 0 && elem.contributionCount <=2:
                    contributionBox = <div className='h-3 w-3 bg-[#0E4529] m-1'></div>
                    break
                  case elem.contributionCount > 2 && elem.contributionCount <=4:
                    contributionBox = <div className='h-3 w-3 bg-[#026E34] m-1'></div>
                    break
                  case elem.contributionCount > 4 && elem.contributionCount <=6:
                    contributionBox = <div className='h-3 w-3 bg-[#27A642] m-1'></div>
                    break
                  case elem.contributionCount >=7:
                    contributionBox = <div className='h-3 w-3 bg-[#39D353] m-1'></div>
                    break
                  default:
                    contributionBox = <div className='h-3 w-3 bg-[#2D323A]'></div>
                }
                
                return (
                  <div>
                  {/* <p className='text-xs text-nowrap'>{elem.date}</p> */}
                  {contributionBox}
                  {/* <p>{elem.contributionCount}</p> */}
                </div>
                )
              })}
            </div>
          )
        })}</div>
      </div>
    </>
   );
}
 
export default App;