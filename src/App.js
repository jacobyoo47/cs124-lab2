import './App.css';
import Title from './Title';
import ButtonContainer from './ButtonContainer';
import Button from './Button';
import List from './List';
import ListItem from './ListItem';


function App(props) {
  // Change between showing non-completed items vs. all items
  const onShow = () => {

  }

  // Remove completed items
  const onRemove = () => {

  }

  return (
    <div className="App">
      <Title/>
      <ButtonContainer>
        <Button text="Show: All" onClick={onShow}/>
        <Button text="Remove Completed" onClick={onRemove}/>
      </ButtonContainer>
      <List>
        {props.data.map((item) =>
          <ListItem text={item.text} completed={item.completed} />
        )}
      </List>
    </div>
  );
}

export default App;
