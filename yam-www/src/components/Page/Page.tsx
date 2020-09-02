import React from 'react'
import styled from 'styled-components'

import Footer from '../Footer'
import TopBar from '../TopBar'
import waves from '../../assets/img/waves.svg'

const Page: React.FC = ({ children }) => (
  <StyledPage>
    <StyledMain>
      {children}
    </StyledMain>
    <Footer />
  </StyledPage>
)

const StyledPage = styled.div`
  background: url(${waves}) center bottom repeat-x;
  background-size: 1920px;
`

const StyledMain = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${props => props.theme.topBarSize * 2}px);
`

export default Page