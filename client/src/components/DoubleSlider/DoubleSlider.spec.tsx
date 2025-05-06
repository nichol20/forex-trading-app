import { render, screen, fireEvent } from "@testing-library/react";
import { DoubleSlider } from "."; 

describe("Slider", () => {
    const setup = () => {
        const handleChange = jest.fn();
        let value: [number, number] = [0, 100]
        render(
          <DoubleSlider value={value} min={0} max={100} step={10} prefix="$" onChange={handleChange} />
        );
        const inputs = screen.getAllByRole("slider");
        return { handleChange, inputs, value };
    };

    it("renders both range inputs and labels", () => {
        setup();
        const inputs = screen.getAllByRole("slider");
        expect(inputs.length).toBe(2);
        expect(screen.getByText("$0")).toBeInTheDocument();
        expect(screen.getByText("max")).toBeInTheDocument();
    });

    it("updates left input and triggers onChange with correct reversed value", () => {
        const { handleChange, inputs } = setup();
        fireEvent.change(inputs[0], { target: { value: "30" } });
        expect(handleChange).toHaveBeenCalledWith([30, 100]); // 100 - value[1] (still 0)
    });

    it("updates right input and triggers onChange with correct reversed value", () => {
        const { handleChange, inputs } = setup();
        fireEvent.change(inputs[1], { target: { value: "20" } });
        expect(handleChange).toHaveBeenCalledWith([0, 80]); // 100 - 20 = 80
    });

    it("does not allow right input to equal max", () => {
        const { handleChange, inputs } = setup();
        fireEvent.change(inputs[1], { target: { value: "100" } }); // targetValue === max
        expect(handleChange).not.toHaveBeenCalled();
    });

    it("shows 'max' label when reversed right value equals max", () => {
        setup();
        expect(screen.getByText("max")).toBeInTheDocument();
    });
});
