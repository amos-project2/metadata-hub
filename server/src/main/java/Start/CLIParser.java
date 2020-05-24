package Start;


import lombok.Getter;

public class CLIParser
{
    private final String[] data;
    @Getter private boolean integrationTest = false;
    @Getter private String configFilePath = null;

    public CLIParser(String[] args)
    {
        data = args;
    }

    public CLIParser parse()
    {
        for (String value : data)
        {
            if (value.equals("-integretationTestEnable"))
            {
                this.integrationTest = true;
            }
            else
            {
                this.configFilePath = value;
            }
        }

        return this;
    }


}
