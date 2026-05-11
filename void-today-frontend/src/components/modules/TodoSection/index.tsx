import {useState} from "react";
import Input from "../../elements/Input";
import Button from "../../elements/Button";

const TodoSection = () => {
    const [todos, setTodos] = useState<string[]>([
        'Learn Atomic Design',
        'Build reusable components'
    ])

    const [value, setValue] = useState('')

    const addTodo = () => {
        if (!value.trim()) return

        setTodos((prev) => [...prev, value])
        setValue('')
    }

    return (
        <section className={'todo-section'}>
            <div className={'todo-create'}>
                <Input
                    placeholder={'Create Todo'}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                />

                <Button onClick={addTodo}>
                    Add
                </Button>
            </div>

            {todos.map((todo, index) => (
                <div key={index} className={'todo-card'}>
                    {todo}
                </div>
            ))}
        </section>
    );
};

export default TodoSection;